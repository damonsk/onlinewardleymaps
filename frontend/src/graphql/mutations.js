/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const createUnauthenticatedMap = /* GraphQL */ `
	mutation CreateUnauthenticatedMap(
		$input: CreateUnauthenticatedMapInput!
		$condition: ModelUnauthenticatedMapConditionInput
	) {
		createUnauthenticatedMap(input: $input, condition: $condition) {
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
export const updateUnauthenticatedMap = /* GraphQL */ `
	mutation UpdateUnauthenticatedMap(
		$input: UpdateUnauthenticatedMapInput!
		$condition: ModelUnauthenticatedMapConditionInput
	) {
		updateUnauthenticatedMap(input: $input, condition: $condition) {
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
export const deleteUnauthenticatedMap = /* GraphQL */ `
	mutation DeleteUnauthenticatedMap(
		$input: DeleteUnauthenticatedMapInput!
		$condition: ModelUnauthenticatedMapConditionInput
	) {
		deleteUnauthenticatedMap(input: $input, condition: $condition) {
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
export const createPublicMap = /* GraphQL */ `
	mutation CreatePublicMap(
		$input: CreatePublicMapInput!
		$condition: ModelPublicMapConditionInput
	) {
		createPublicMap(input: $input, condition: $condition) {
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
export const updatePublicMap = /* GraphQL */ `
	mutation UpdatePublicMap(
		$input: UpdatePublicMapInput!
		$condition: ModelPublicMapConditionInput
	) {
		updatePublicMap(input: $input, condition: $condition) {
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
export const deletePublicMap = /* GraphQL */ `
	mutation DeletePublicMap(
		$input: DeletePublicMapInput!
		$condition: ModelPublicMapConditionInput
	) {
		deletePublicMap(input: $input, condition: $condition) {
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
export const createMap = /* GraphQL */ `
	mutation CreateMap(
		$input: CreateMapInput!
		$condition: ModelMapConditionInput
	) {
		createMap(input: $input, condition: $condition) {
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
export const updateMap = /* GraphQL */ `
	mutation UpdateMap(
		$input: UpdateMapInput!
		$condition: ModelMapConditionInput
	) {
		updateMap(input: $input, condition: $condition) {
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
export const deleteMap = /* GraphQL */ `
	mutation DeleteMap(
		$input: DeleteMapInput!
		$condition: ModelMapConditionInput
	) {
		deleteMap(input: $input, condition: $condition) {
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
