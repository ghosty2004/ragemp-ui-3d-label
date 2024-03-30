export type InjectablePlayerEntityProperties = {
	action: string;
	armour: number;
	heading: number;
	health: number;
	model: number;
	name: string;
	ping: number;
	remoteId: number;
	voiceVolume: number;
	vehicle: InjectableVehicleEntityProperties;
};

export type InjectableVehicleEntityProperties = {
	gear: number;
	model: number;
	remoteId: number;
	rpm: number;
	steeringAngle: number;
	wheelCount: number;
};

export type InjectableObjectEntityProperties = {
	model: number;
	remoteId: number;
};

export type InjectablePedEntityProperties = {
	model: number;
	remoteId: number;
	controller: InjectablePlayerEntityProperties;
	spawnPosition: Vector3;
};
