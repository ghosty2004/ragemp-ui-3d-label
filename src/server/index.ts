import { UI3DTextLabel } from './libs';
import { Vehicle as VehicleLabel, Player as PlayerLabel, RandomLabel } from './labels';

declare global {
	interface TextLabelUI3DOptions {
		dimension: number;
		drawDistance: number;
		attachedTo: EntityMp | null;
		attachedAtBoneIndex: number | null;
		attachedOffset: Vector3;
	}

	interface TextLabelMpPool {
		UI3D: {
			new: (htmlContent: any, position: Vector3, options?: Partial<TextLabelUI3DOptions>) => UI3DTextLabel;
			destroy: (index: number) => void;
			destroyAll: () => void;
			at: (index: number) => UI3DTextLabel;
			exists: (index: number) => boolean;
			toArray(): UI3DTextLabel[];
			length: number;
		};
	}
}

// we add the UI pool to the TextLabelMpPool
mp.labels.UI3D = {
	/**
	 * Create a new UI3DTextLabel
	 */
	new: (...propeties: any[]) => new UI3DTextLabel(...(propeties as Parameters<TextLabelMpPool['UI3D']['new']>)),
	/**
	 * Destroy a UI3DTextLabel by index
	 */
	destroy: (index: number) => UI3DTextLabel.destroyByIndex(index),
	/**
	 * Destroy all UI3DTextLabels
	 */
	destroyAll: () => UI3DTextLabel.destroyAll(),
	/**
	 * Get a UI3DTextLabel by index
	 */
	at: (index: number) => UI3DTextLabel.cache[index],
	/**
	 * Check if a UI3DTextLabel exists by index
	 */
	exists: (index: number) => !!UI3DTextLabel.cache[index],
	/**
	 * Get all UI3DTextLabels
	 */
	toArray: () => UI3DTextLabel.cache,
	/**
	 * Get the length of the UI3DTextLabels
	 */
	get length() {
		return UI3DTextLabel.length;
	},
};

// We load all labels for specific player when he joins
mp.events.add('playerJoin', UI3DTextLabel.loadForPlayer);

// We destroy all labels for specific player when he quits
mp.events.add('playerQuit', UI3DTextLabel.checkEntityOnDestroy);

// test commands
mp.events.addCommand('vehicle', (player, fullText) => {
	const [vehicleModel] = (fullText || '').split(' ');
	if (!vehicleModel) return player.outputChatBox('/vehicle [vehicleModel]');

	const vehicle = mp.vehicles.new(mp.joaat(vehicleModel), player.position);

	mp.labels.UI3D.new(VehicleLabel, vehicle.position, {
		attachedTo: vehicle,
	});
});

mp.events.addCommand('deletevehicle', (player) => {
	mp.labels.UI3D.toArray()
		.filter((f) => f.attachedTo === player.vehicle)
		.forEach((f) => f.destroy());

	player.vehicle?.destroy();
});

mp.events.addCommand('player', (player) => {
	mp.labels.UI3D.new(PlayerLabel, player.position, {
		drawDistance: 30,
		attachedTo: player,
		attachedAtBoneIndex: 99, // head
		attachedOffset: new mp.Vector3(0, 0, 0.5), // a little bit above the head
	});
});

mp.events.addCommand('label', (player) => {
	mp.labels.UI3D.new(RandomLabel, player.position, {
		drawDistance: 30,
	});
});

export {};
