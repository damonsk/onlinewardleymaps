export const schema = {
	models: {
		PublicMap: {
			name: 'PublicMap',
			fields: {
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
				mapText: {
					name: 'mapText',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				readOnly: {
					name: 'readOnly',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				name: {
					name: 'name',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				imageData: {
					name: 'imageData',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				createdAt: {
					name: 'createdAt',
					isArray: false,
					type: 'AWSDateTime',
					isRequired: false,
					attributes: [],
					isReadOnly: true,
				},
				updatedAt: {
					name: 'updatedAt',
					isArray: false,
					type: 'AWSDateTime',
					isRequired: false,
					attributes: [],
					isReadOnly: true,
				},
			},
			syncable: true,
			pluralName: 'PublicMaps',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
				{
					type: 'auth',
					properties: {
						rules: [
							{
								allow: 'public',
								operations: ['read', 'update'],
							},
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'owner',
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
					},
				},
			],
		},
		UnauthenticatedMap: {
			name: 'UnauthenticatedMap',
			fields: {
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
				mapText: {
					name: 'mapText',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				name: {
					name: 'name',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				imageData: {
					name: 'imageData',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				createdAt: {
					name: 'createdAt',
					isArray: false,
					type: 'AWSDateTime',
					isRequired: false,
					attributes: [],
					isReadOnly: true,
				},
				updatedAt: {
					name: 'updatedAt',
					isArray: false,
					type: 'AWSDateTime',
					isRequired: false,
					attributes: [],
					isReadOnly: true,
				},
			},
			syncable: true,
			pluralName: 'UnauthenticatedMaps',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
				{
					type: 'auth',
					properties: {
						rules: [
							{
								allow: 'public',
								operations: ['create', 'read', 'update'],
							},
						],
					},
				},
			],
		},
		Map: {
			name: 'Map',
			fields: {
				id: {
					name: 'id',
					isArray: false,
					type: 'ID',
					isRequired: true,
					attributes: [],
				},
				mapText: {
					name: 'mapText',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				private: {
					name: 'private',
					isArray: false,
					type: 'Boolean',
					isRequired: false,
					attributes: [],
				},
				name: {
					name: 'name',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				imageData: {
					name: 'imageData',
					isArray: false,
					type: 'String',
					isRequired: false,
					attributes: [],
				},
				createdAt: {
					name: 'createdAt',
					isArray: false,
					type: 'AWSDateTime',
					isRequired: false,
					attributes: [],
					isReadOnly: true,
				},
				updatedAt: {
					name: 'updatedAt',
					isArray: false,
					type: 'AWSDateTime',
					isRequired: false,
					attributes: [],
					isReadOnly: true,
				},
			},
			syncable: true,
			pluralName: 'Maps',
			attributes: [
				{
					type: 'model',
					properties: {},
				},
				{
					type: 'auth',
					properties: {
						rules: [
							{
								provider: 'userPools',
								ownerField: 'owner',
								allow: 'owner',
								identityClaim: 'cognito:username',
								operations: ['create', 'update', 'delete', 'read'],
							},
						],
					},
				},
			],
		},
	},
	enums: {},
	nonModels: {},
	version: '932165950856924bde630720d0bd5fd7',
};
