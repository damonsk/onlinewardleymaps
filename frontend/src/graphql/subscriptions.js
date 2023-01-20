/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const onCreateUnauthenticatedMap = /* GraphQL */ `
	subscription OnCreateUnauthenticatedMap(
		$filter: ModelSubscriptionUnauthenticatedMapFilterInput
	) {
		onCreateUnauthenticatedMap(filter: $filter) {
			id
			mapText
			name
			imageData
			mapIterations
			createdAt
			updatedAt
		}
	}
`;
export const onUpdateUnauthenticatedMap = /* GraphQL */ `
	subscription OnUpdateUnauthenticatedMap(
		$filter: ModelSubscriptionUnauthenticatedMapFilterInput
	) {
		onUpdateUnauthenticatedMap(filter: $filter) {
			id
			mapText
			name
			imageData
			mapIterations
			createdAt
			updatedAt
		}
	}
`;
export const onDeleteUnauthenticatedMap = /* GraphQL */ `
	subscription OnDeleteUnauthenticatedMap(
		$filter: ModelSubscriptionUnauthenticatedMapFilterInput
	) {
		onDeleteUnauthenticatedMap(filter: $filter) {
			id
			mapText
			name
			imageData
			mapIterations
			createdAt
			updatedAt
		}
	}
`;
export const onCreatePublicMap = /* GraphQL */ `
	subscription OnCreatePublicMap(
		$filter: ModelSubscriptionPublicMapFilterInput
		$owner: String
	) {
		onCreatePublicMap(filter: $filter, owner: $owner) {
			id
			mapText
			readOnly
			name
			imageData
			mapIterations
			createdAt
			updatedAt
			owner
		}
	}
`;
export const onUpdatePublicMap = /* GraphQL */ `
	subscription OnUpdatePublicMap(
		$filter: ModelSubscriptionPublicMapFilterInput
		$owner: String
	) {
		onUpdatePublicMap(filter: $filter, owner: $owner) {
			id
			mapText
			readOnly
			name
			imageData
			mapIterations
			createdAt
			updatedAt
			owner
		}
	}
`;
export const onDeletePublicMap = /* GraphQL */ `
	subscription OnDeletePublicMap(
		$filter: ModelSubscriptionPublicMapFilterInput
		$owner: String
	) {
		onDeletePublicMap(filter: $filter, owner: $owner) {
			id
			mapText
			readOnly
			name
			imageData
			mapIterations
			createdAt
			updatedAt
			owner
		}
	}
`;
export const onCreateMap = /* GraphQL */ `
	subscription OnCreateMap(
		$filter: ModelSubscriptionMapFilterInput
		$owner: String
	) {
		onCreateMap(filter: $filter, owner: $owner) {
			id
			mapText
			private
			name
			imageData
			mapIterations
			createdAt
			updatedAt
			owner
		}
	}
`;
export const onUpdateMap = /* GraphQL */ `
	subscription OnUpdateMap(
		$filter: ModelSubscriptionMapFilterInput
		$owner: String
	) {
		onUpdateMap(filter: $filter, owner: $owner) {
			id
			mapText
			private
			name
			imageData
			mapIterations
			createdAt
			updatedAt
			owner
		}
	}
`;
export const onDeleteMap = /* GraphQL */ `
	subscription OnDeleteMap(
		$filter: ModelSubscriptionMapFilterInput
		$owner: String
	) {
		onDeleteMap(filter: $filter, owner: $owner) {
			id
			mapText
			private
			name
			imageData
			mapIterations
			createdAt
			updatedAt
			owner
		}
	}
`;
