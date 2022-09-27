import React from 'react';

const Breadcrumb = ({
	currentUrl,
	localMaps,
	loadLocalMap,
	areLocalMapsAvailable,
}) => {
	return (
		<nav aria-label="breadcrumb" className="bc">
			<ol className="breadcrumb" data-testid="breadcrumb-list">
				<li className="breadcrumb-item" data-testid="breadcrumb-list-item">
					Your Map:{' '}
					{currentUrl && (
						<>
							<span>Remotely: </span>
							<a
								href={currentUrl.indexOf('#') === -1 ? '#' : currentUrl}
								id="url"
								data-testid="breadcrumb-list-item-your-map"
							>
								{currentUrl.indexOf('#') === -1 ? '(unsaved)' : currentUrl}
							</a>
						</>
					)}
					{areLocalMapsAvailable && (
						<>
							<span className="breadcrumb-list-label">Local: </span>
							{localMaps.map(localMap => (
								<span
									className="breadcrumb-list-local"
									onClick={() => loadLocalMap(localMap.id)}
									key={localMap.id}
								>
									{localMap.title}({localMap.id})
								</span>
							))}
						</>
					)}
				</li>
			</ol>
		</nav>
	);
};

export default Breadcrumb;
