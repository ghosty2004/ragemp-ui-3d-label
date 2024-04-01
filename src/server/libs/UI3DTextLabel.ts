import { renderToStaticMarkup } from 'react-dom/server';
import { UI3DTextLabelComponentProps } from 'types';

export class UI3DTextLabel {
	static cache: UI3DTextLabel[] = [];
	static identifierCount = 0;

	private identifier: string;
	private _htmlContent: string;
	private _position: Vector3;
	private _options: TextLabelUI3DOptions;

	constructor(htmlContent: string | ((props: UI3DTextLabelComponentProps) => React.JSX.Element), position: Vector3, options?: Partial<TextLabelUI3DOptions>) {
		// increment the identifier count
		UI3DTextLabel.identifierCount++;

		// set the identifier for this instance
		this.identifier = `ui3dtextlabel_${UI3DTextLabel.identifierCount}`;

		this._options = {
			dimension: options?.dimension || 0,
			drawDistance: options?.drawDistance || 200,
			attachedTo: options?.attachedTo || null,
			attachedAtBoneIndex: options?.attachedAtBoneIndex || null,
			attachedOffset: options?.attachedOffset || new mp.Vector3(0, 0, 0),
		};

		this._htmlContent = this.processHtmlContent(htmlContent);
		this._position = position;

		// add this instance to the cache
		UI3DTextLabel.cache.push(this);

		// load this label for all players
		UI3DTextLabel.loadForPlayer(undefined, this.identifier);
	}

	set htmlContent(htmlContent: string | ((props: UI3DTextLabelComponentProps) => React.JSX.Element)) {
		this._htmlContent = this.processHtmlContent(htmlContent);

		mp.players.call('UI3DTextLabel:update:htmlContent', [this.identifier, this.htmlContent]);
	}

	get htmlContent() {
		return this._htmlContent;
	}

	set position(position: Vector3) {
		this._position = position;
		mp.players.call('UI3DTextLabel:update:position', [this.identifier, this.position]);
	}

	get position() {
		return this._position;
	}

	set dimension(dimension: number) {
		this._options.dimension = dimension;
		mp.players.call('UI3DTextLabel:update:dimension', [this.identifier, dimension]);
	}

	get dimension() {
		return this._options.dimension;
	}

	set drawDistance(drawDistance: number) {
		this._options.drawDistance = drawDistance;
		mp.players.call('UI3DTextLabel:update:drawDistance', [this.identifier, drawDistance]);
	}

	get drawDistance() {
		return this._options.drawDistance;
	}

	set attachedTo(attachedTo: EntityMp | null) {
		this._options.attachedTo = attachedTo;
		mp.players.call('UI3DTextLabel:update:attachedTo', [this.identifier, this.getAttachedTo()]);
	}

	get attachedTo() {
		return this._options.attachedTo;
	}

	set attachedAtBoneIndex(attachedAtBoneIndex: number) {
		this._options.attachedAtBoneIndex = attachedAtBoneIndex;
		mp.players.call('UI3DTextLabel:update:attachedAtBoneIndex', [this.identifier, attachedAtBoneIndex]);
	}

	get attachedAtBoneIndex(): number | null {
		return this._options.attachedAtBoneIndex;
	}

	set attachedOffset(attachedOffset: Vector3) {
		this._options.attachedOffset = attachedOffset;
		mp.players.call('UI3DTextLabel:update:attachedOffset', [this.identifier, attachedOffset]);
	}

	get attachedOffset() {
		return this._options.attachedOffset;
	}

	getAttachedTo() {
		const entityType = this.getAttachedToType();

		return entityType !== null
			? {
					type: entityType,
					remoteId: this.attachedTo!.id,
			  }
			: null;
	}

	getAttachedToType() {
		switch (true) {
			case this.attachedTo instanceof mp.Player:
				return 'player';
			case this.attachedTo instanceof mp.Vehicle:
				return 'vehicle';
			case this.attachedTo instanceof mp.Object:
				return 'object';
			case this.attachedTo instanceof mp.Ped:
				return 'ped';
			default:
				return null;
		}
	}

	destroy() {
		const index = UI3DTextLabel.cache.indexOf(this);
		if (index === -1) return;
		UI3DTextLabel.cache.splice(index, 1);
		mp.players.call('UI3DTextLabel:destroy', [this.identifier]);
	}

	toJSON() {
		return {
			identifier: this.identifier,
			htmlContent: this.htmlContent,
			position: this.position,
			options: {
				dimension: this.dimension,
				drawDistance: this.drawDistance,
				attachedTo: this.getAttachedTo(),
				attachedAtBoneIndex: this.attachedAtBoneIndex,
				attachedOffset: this.attachedOffset,
			},
		};
	}

	processHtmlContent(htmlContent: string | ((props: UI3DTextLabelComponentProps) => React.JSX.Element)) {
		return typeof htmlContent === 'string'
			? htmlContent
			: renderToStaticMarkup(
					htmlContent({
						attachedEntityType: this.getAttachedToType(),
						// @ts-ignore
						injectVariable: (variable) => `%{${variable}}%`,
					})
			  );
	}

	static destroyByIndex(index: number) {
		if (UI3DTextLabel.cache[index]) {
			UI3DTextLabel.cache[index].destroy();
		}
	}

	static destroyAll() {
		UI3DTextLabel.cache.forEach((label) => label.destroy());
	}

	static loadForPlayer(player?: PlayerMp, identifier?: string) {
		const label = UI3DTextLabel.cache.find((f) => f.identifier === identifier);

		switch (true) {
			// if player and index is not defined we load all labels for all players
			case typeof player !== 'undefined' && typeof label === 'undefined':
				return mp.players.call('UI3DTextLabel:load', [UI3DTextLabel.cache.map((label) => label.toJSON())]);

			// if player is not defined but index is defined we load only for specific index
			case typeof player === 'undefined' && typeof label !== 'undefined':
				return mp.players.call('UI3DTextLabel:load', [label.toJSON()]);

			// if player and index is defined we load only for specific player and index
			case typeof player !== 'undefined' && typeof label !== 'undefined':
				return player.call('UI3DTextLabel:load', [label.toJSON()]);

			// if player is defined but index is not defined we load all labels for specific player
			case typeof player !== 'undefined' && typeof label === 'undefined':
				return player.call('UI3DTextLabel:load', [UI3DTextLabel.cache.map((label) => label.toJSON())]);
		}
	}

	static checkEntityOnDestroy(entity: EntityMp) {
		const attachedLabelsToPlayer = UI3DTextLabel.cache.filter((label) => label.attachedTo === entity);
		attachedLabelsToPlayer.forEach((label) => label.destroy());
	}
}
