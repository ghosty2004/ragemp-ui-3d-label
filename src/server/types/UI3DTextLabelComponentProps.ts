import { InjectableObjectEntityProperties, InjectablePedEntityProperties, InjectablePlayerEntityProperties, InjectableVehicleEntityProperties } from './InjectableEntityProperties';
import { RecursiveKeyNames } from './RecursiveKeyNames';

type InjectableVariables<T> = {
	attachedEntity: T extends null
		? unknown
		: T & {
				remoteId: number;
				dimension: number;
				position: Vector3;
				rotation: Vector3;
		  };
};

type WithPlayer = {
	attachedEntityType: 'player';
	injectVariable<T extends RecursiveKeyNames<InjectableVariables<InjectablePlayerEntityProperties>>>(variable: T): string;
};

type WithVehicle = {
	attachedEntityType: 'vehicle';
	injectVariable<T extends RecursiveKeyNames<InjectableVariables<InjectableVehicleEntityProperties>>>(variable: T): string;
};

type WithObject = {
	attachedEntityType: 'object';
	injectVariable<T extends RecursiveKeyNames<InjectableVariables<InjectableObjectEntityProperties>>>(variable: T): string;
};

type WithPed = {
	attachedEntityType: 'ped';
	injectVariable<T extends RecursiveKeyNames<InjectableVariables<InjectablePedEntityProperties>>>(variable: T): string;
};

type WithUnknown = {
	attachedEntityType: null;
	injectVariable<T extends RecursiveKeyNames<InjectableVariables<null>>>(variable: T): string;
};

export type UI3DTextLabelComponentProps = WithVehicle | WithPlayer | WithObject | WithPed | WithUnknown;
