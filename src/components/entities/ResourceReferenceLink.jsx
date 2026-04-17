import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {
    buildResourcePath,
    getAudiobookName,
    getGenreName,
    getUserName,
} from "../../utils/resourceRouting.js";

const RESOURCE_CONFIG = {
    audiobooks: {getName: getAudiobookName},
    genres: {getName: getGenreName},
    users: {getName: getUserName},
};

const resourceCache = new Map();

function ResourceReferenceLink({resourceType, resourceUrl, fallbackLabel}) {
    const [resource, setResource] = useState(() => resourceCache.get(resourceUrl) || null);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let ignore = false;
        const config = RESOURCE_CONFIG[resourceType];

        if (!resourceUrl || !config) {
            return;
        }

        if (resourceCache.has(resourceUrl)) {
            setResource(resourceCache.get(resourceUrl));
            return;
        }

        async function loadReference() {
            try {
                const response = await fetch(resourceUrl);
                if (!response.ok) {
                    throw new Error(`API call for ${resourceType} details failed with status ${response.status}`);
                }

                const data = await response.json();
                resourceCache.set(resourceUrl, data);
                if (!ignore) {
                    setResource(data);
                }
            } catch (error) {
                console.error(error);
                if (!ignore) {
                    setHasError(true);
                }
            }
        }

        void loadReference();

        return () => {
            ignore = true;
        };
    }, [resourceType, resourceUrl]);

    if (!resourceUrl) {
        return <span>{fallbackLabel || "onbekend"}</span>;
    }

    const config = RESOURCE_CONFIG[resourceType];
    if (!config) {
        return <span>{fallbackLabel || resourceUrl}</span>;
    }

    if (hasError || !resource) {
        return <span>{fallbackLabel || resourceUrl}</span>;
    }

    return (
        <Link to={buildResourcePath(resourceType, resource, config.getName)} state={{resourceUrl}}>
            {config.getName(resource)}
        </Link>
    );
}

export default ResourceReferenceLink;

