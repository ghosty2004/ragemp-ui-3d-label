import React from 'react';
import { UI3DTextLabelComponentProps } from '../types';

export const Vehicle = ({ attachedEntityType, injectVariable }: UI3DTextLabelComponentProps) =>
	attachedEntityType === 'vehicle' && (
		<div style={{ fontFamily: 'monospace', textAlign: 'center', fontWeight: 'bold', textShadow: '-1px -1px 0 #000000B2, 1px -1px 0 #000000B2, -1px 1px 0 #000000B2, 1px 1px 0 #000000B2' }}>
			<span style={{ color: 'red' }}>
				Position:
				<span style={{ color: 'yellow' }}>
					{injectVariable('attachedEntity.position.x')} {injectVariable('attachedEntity.position.y')} {injectVariable('attachedEntity.position.z')}
				</span>
			</span>
		</div>
	);
