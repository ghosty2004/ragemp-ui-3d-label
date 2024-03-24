interface IUI3DTextLabel {
	identifier: string;
	_active: boolean;
	active: boolean;
	text: string;
	position: Vector3;
	options: {
		dimension: number;
		drawDistance: number;
		attachedTo: EntityMp | null;
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
	browser.call('UI3DTextLabel:add', { identifier: label.identifier, text: label.text, position: label.position });
};

const getLabelAttachedEntity = ({ options: { attachedTo } }: IUI3DTextLabel) => {
	return (attachedTo?.handle !== 0 ? attachedTo : null) as EntityMp | null;
};

/**
 * Update a 3D text label in the browser.
 */
const updateLabelInBrowser = <T extends keyof Omit<IUI3DTextLabel, 'identifier' | '_active' | 'active' | 'options'>>(identifier: string, option: T, value: IUI3DTextLabel[T]) => {
	browser.call('UI3DTextLabel:update', identifier, option, value);
};

// Events
mp.events.add('UI3DTextLabel:load', (payload: IUI3DTextLabel[] | IUI3DTextLabel) => {
	// convert the payload to an array if it's not already
	const loadedLabels = Array.isArray(payload) ? payload : [payload];

	// add the labels to the cache
	labels.push(
		...loadedLabels.map((label) => ({
			...label,
			set active(isActive) {
				this._active = isActive;
			},
			get active() {
				return this._active;
			}
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

mp.events.add('UI3DTextLabel:update:text', (identifier: string, text: string) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].text = text;
	updateLabelInBrowser(identifier, 'text', text);
});

mp.events.add('UI3DTextLabel:update:position', (identifier: string, position: Vector3) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].position = position;
	updateLabelInBrowser(identifier, 'position', position);
});

mp.events.add('UI3DTextLabel:update:dimension', (identifier: string, dimension: number) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.dimension = dimension;
});

mp.events.add('UI3DTextLabel:update:drawDistance', (identifier: string, drawDistance: number) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.drawDistance = drawDistance;
});

mp.events.add('UI3DTextLabel:update:attachedTo', (identifier: string, attachedTo: EntityMp | null) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.attachedTo = attachedTo;
});

mp.events.add('UI3DTextLabel:update:attachedAtBoneIndex', (identifier: string, attachedAtBoneIndex: number) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.attachedAtBoneIndex = attachedAtBoneIndex;
});

mp.events.add('UI3DTextLabel:update:attachedOffset', (identifier: string, attachedOffset: Vector3) => {
	const index = labels.findIndex((label) => label.identifier === identifier);
	if (index === -1) return;
	labels[index].options.attachedOffset = attachedOffset;
});

mp.events.add('render', () => {
	const labelsThatNeedToDisable = labels.filter((label) => {
		const attachedEntity = getLabelAttachedEntity(label);
		const position = attachedEntity ? attachedEntity.position : label.position;
		return mp.game.system.vdist(player.position.x, player.position.y, player.position.z, position.x, position.y, position.z) > label.options.drawDistance && label.active;
	});

	const labelsThatNeedToEnable = labels.filter((label) => {
		const attachedEntity = getLabelAttachedEntity(label);
		const position = attachedEntity ? attachedEntity.position : label.position;
		return mp.game.system.vdist(player.position.x, player.position.y, player.position.z, position.x, position.y, position.z) < label.options.drawDistance && !label.active;
	});

	labelsThatNeedToDisable.forEach(disableLabel);
	labelsThatNeedToEnable.forEach(enableLabel);

	const screenRes = mp.game.graphics.getActiveScreenResolution();

	labels
		.filter((f) => f.active)
		.forEach((label) => {
			const attachedEntity = getLabelAttachedEntity(label);
			const attachedAtBoneIndex = label.options.attachedAtBoneIndex;
			const attachedOffset = label.options.attachedOffset;

			const position = attachedEntity ? (attachedAtBoneIndex !== null ? attachedEntity.getWorldPositionOfBone(attachedAtBoneIndex) : attachedEntity.position) : label.position;

			const pos2D = mp.game.graphics.world3dToScreen2d(new mp.Vector3(position.x + attachedOffset.x, position.y + attachedOffset.y, position.z + attachedOffset.z));
			if (!pos2D) return;

			updateLabelInBrowser(label.identifier, 'position', new mp.Vector3(pos2D.x * screenRes.x, pos2D.y * screenRes.y, 0));
		});
});
