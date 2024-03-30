import React from 'react';
import { UI3DTextLabelComponentProps } from '../types';

export const Vehicle = ({ attachedEntityType, injectVariable }: UI3DTextLabelComponentProps) =>
	attachedEntityType === 'vehicle' && (
		<div>
			<span style={{ color: 'red' }}>
				Position:
				<span style={{ color: 'yellow' }}>
					{injectVariable('attachedEntity.position.x')} {injectVariable('attachedEntity.position.y')} {injectVariable('attachedEntity.position.z')}
				</span>
			</span>
		</div>
	);
