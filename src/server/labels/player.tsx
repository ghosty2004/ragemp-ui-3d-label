import React from 'react';
import { UI3DTextLabelComponentProps } from '../types';

export const Player = ({ attachedEntityType, injectVariable }: UI3DTextLabelComponentProps) => {
	if (attachedEntityType !== 'player') return null;

	const position = `${injectVariable('attachedEntity.position.x')}, ${injectVariable('attachedEntity.position.y')}, ${injectVariable('attachedEntity.position.z')}`;

	return (
		<div style={{ fontFamily: 'Arial' }}>
			<span style={{ color: 'red' }}>Name: {injectVariable('attachedEntity.name')}</span>
			<br />
			<span style={{ color: 'white' }}>ID: {injectVariable('attachedEntity.remoteId')}</span>
			<br />
			<span style={{ color: 'blue' }}>Health: {injectVariable('attachedEntity.health')}</span>
			<br />
			<span style={{ color: 'green' }}>Position: {position}</span>
		</div>
	);
};
