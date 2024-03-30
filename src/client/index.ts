interface IUI3DTextLabel {
	identifier: string;
	active: boolean;
	htmlContent: string;
	lastHtmlContentInBrowser: string;
	position: Vector3;
	options: {
		dimension: number;
		drawDistance: number;
		attachedTo: {
			type: 'player' | 'vehicle' | 'object' | 'ped';
			remoteId: number;
		} | null;
		attachedAtBoneIndex: number | null;
		attachedOffset: Vector3;
	};
}

const player = mp.players.local;
const labels: IUI3DTextLabel[] = [];
const browser = mp.browsers.new(`package://html/index.html?nocache=${Date.now()}`);

const disableLabel = (label: IUI3DTextLabel) => {
	label.active = false;
	browser.call('UI3DTextLabel:remove', label.identifier);
};

const enableLabel = (label: IUI3DTextLabel) => {
	label.active = true;
	browser.call('UI3DTextLabel:add', { identifier: label.identifier, htmlContent: label.lastHtmlContentInBrowser, position: label.position });
};

const updateLabelsInBrowser = <T extends keyof Omit<IUI3DTextLabel, 'identifier' | 'active' | 'options'>>(arrayOfTextLabels: { identifier: string; parts: [T, IUI3DTextLabel[T]][] }[]) => {
	if (!arrayOfTextLabels.length) return;
	browser.call('UI3DTextLabel:updateMore', arrayOfTextLabels);
};

const getLabelAttachedEntity = ({ options: { attachedTo } }: IUI3DTextLabel) => {
	const attachedEntity =
		attachedTo?.type === 'player'
			? mp.players.atRemoteId(attachedTo.remoteId)
			: attachedTo?.type === 'vehicle'
			? mp.vehicles.atRemoteId(attachedTo.remoteId)
			: attachedTo?.type === 'object'
			? mp.objects.atRemoteId(attachedTo.remoteId)
			: attachedTo?.type === 'ped'
			? mp.peds.atRemoteId(attachedTo.remoteId)
			: null;

	return attachedEntity?.handle !== 0 ? attachedEntity : null;
};

const evaluateHtmlContentVars = (label: IUI3DTextLabel) => {
	const injectionRegex = /%\{([^}]+)\}%/g;

	const result = label.htmlContent.replace(injectionRegex, (_match, variable: string) => {
		const objects = variable.split('.');

		switch (objects[0]) {
			case 'attachedEntity':
				const attachedEntity = getLabelAttachedEntity(label);
				if (!attachedEntity) return '';

				const result = objects.slice(1).reduce((acc: any, curr) => acc?.[curr], attachedEntity);

				return `${typeof result !== 'undefined' ? result : ''}`;
			default:
				return '';
		}
	});

	return result;
};

// Events
mp.events.add('UI3DTextLabel:load', (payload: IUI3DTextLabel[] | IUI3DTextLabel) => {
	// convert the payload to an array if it's not already
	const loadedLabels = Array.isArray(payload) ? payload : [payload];

	// add the labels to the cache
	labels.push(
		...loadedLabels.map((label) => ({
			...label,
			active: false,
		}))
	);
});

mp.events.add('UI3DTextLabel:destroy', (identifier: string) => {
	// search for the label in the cache
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;

	// disable the label
	disableLabel(labels[index]);

	// remove the label from the cache
	labels.splice(index, 1);
});

mp.events.add('UI3DTextLabel:update:htmlContent', (identifier: string, htmlContent: string) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].htmlContent = htmlContent;
	updateLabelsInBrowser([{ identifier, parts: [['htmlContent', htmlContent]] }]);
});

mp.events.add('UI3DTextLabel:update:position', (identifier: string, position: Vector3) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].position = position;
	updateLabelsInBrowser([{ identifier, parts: [['position', position]] }]);
});

mp.events.add('UI3DTextLabel:update:dimension', (identifier: string, dimension: IUI3DTextLabel['options']['dimension']) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.dimension = dimension;
});

mp.events.add('UI3DTextLabel:update:drawDistance', (identifier: string, drawDistance: IUI3DTextLabel['options']['drawDistance']) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.drawDistance = drawDistance;
});

mp.events.add('UI3DTextLabel:update:attachedTo', (identifier: string, attachedTo: IUI3DTextLabel['options']['attachedTo']) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.attachedTo = attachedTo;
});

mp.events.add('UI3DTextLabel:update:attachedAtBoneIndex', (identifier: string, attachedAtBoneIndex: IUI3DTextLabel['options']['attachedAtBoneIndex']) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.attachedAtBoneIndex = attachedAtBoneIndex;
});

mp.events.add('UI3DTextLabel:update:attachedOffset', (identifier: string, attachedOffset: IUI3DTextLabel['options']['attachedOffset']) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.attachedOffset = attachedOffset;
});

const getLabelAttachmentInformations = (label: IUI3DTextLabel) => {
	const attachedEntity = getLabelAttachedEntity(label);
	const attachedAtBoneIndex = label.options.attachedAtBoneIndex;
	const position = attachedEntity ? (attachedAtBoneIndex !== null ? attachedEntity.getWorldPositionOfBone(attachedAtBoneIndex) : attachedEntity.position) : label.position;
	const dimension = attachedEntity ? attachedEntity.dimension : label.options.dimension;

	return { position, dimension };
};

mp.events.add('render', () => {
	// get the labels that need to be disabled
	const labelsThatNeedToDisable = labels.filter((label) => {
		const { position, dimension } = getLabelAttachmentInformations(label);

		const isPlayerNotInLabelDrawDistance = mp.game.system.vdist(player.position.x, player.position.y, player.position.z, position.x, position.y, position.z) > label.options.drawDistance;
		const isPlayerNotInLabelDimension = player.dimension !== dimension;
		const is2DPositionNotAvailable = !mp.game.graphics.world3dToScreen2d(position);
		const isLabelActive = label.active;

		return (isPlayerNotInLabelDrawDistance || isPlayerNotInLabelDimension || is2DPositionNotAvailable) && isLabelActive;
	});

	// get the labels that need to be enabled
	const labelsThatNeedToEnable = labels.filter((label) => {
		const { position, dimension } = getLabelAttachmentInformations(label);

		const isPlayerInLabelDrawDistance = mp.game.system.vdist(player.position.x, player.position.y, player.position.z, position.x, position.y, position.z) < label.options.drawDistance;
		const isPlayerInLabelDimension = player.dimension === dimension;
		const is2DPositionAvailable = !!mp.game.graphics.world3dToScreen2d(position);
		const isLabelNotActive = !label.active;

		return isPlayerInLabelDrawDistance && isPlayerInLabelDimension && isLabelNotActive && is2DPositionAvailable;
	});

	// enable or disable the labels
	labelsThatNeedToDisable.forEach(disableLabel);
	labelsThatNeedToEnable.forEach(enableLabel);

	// get the active screen resolution
	const screenRes = mp.game.graphics.getActiveScreenResolution();

	// get the labels that need to be updated
	const labelsWhichNeedToBeUpdated = labels
		.filter((f) => f.active)
		.map((label) => {
			const identifier = label.identifier;
			const { position } = getLabelAttachmentInformations(label);
			const pos2D = mp.game.graphics.world3dToScreen2d(position);

			const labelPosition = new mp.Vector3(pos2D.x * screenRes.x, pos2D.y * screenRes.y, 0);
			const labelHtmlContent = evaluateHtmlContentVars(label);

			return {
				identifier,
				parts: [
					['position', labelPosition],
					['htmlContent', labelHtmlContent],
				] as [keyof Omit<IUI3DTextLabel, 'identifier' | 'active' | 'options'>, any][],
			};
		});

	updateLabelsInBrowser(labelsWhichNeedToBeUpdated);
});
