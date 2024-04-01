import React from 'react';
import { UI3DTextLabelComponentProps } from '../types';

export const Player = ({ attachedEntityType, injectVariable }: UI3DTextLabelComponentProps) => {
	if (attachedEntityType !== 'player') return null;

	const position = `${injectVariable('attachedEntity.position.x')}, ${injectVariable('attachedEntity.position.y')}, ${injectVariable('attachedEntity.position.z')}`;

	return (
		<div
			style={{
				fontFamily: 'monospace',
				textAlign: 'center',
				fontWeight: 'bold',
				fontSize: '18px',
				textShadow: '-1px -1px 0 #000000B2, 1px -1px 0 #000000B2, -1px 1px 0 #000000B2, 1px 1px 0 #000000B2',
			}}
		>
			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px' }}>
				<img src="https://avatars.githubusercontent.com/u/72819231?v=4" height={'50px'} width={'50px'} />
				<span style={{ color: 'red' }}>Name: {injectVariable('attachedEntity.name')}</span>
			</div>
			<br />
			<span style={{ color: 'white' }}>ID: {injectVariable('attachedEntity.remoteId')}</span>
			<br />
			<span style={{ color: 'blue' }}>Health: {injectVariable('attachedEntity.health')}</span>
			<br />
			<span style={{ color: 'green' }}>Position: {position}</span>
		</div>
	);
};
