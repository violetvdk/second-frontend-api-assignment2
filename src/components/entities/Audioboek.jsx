import {useEffect, useState} from "react";
import {useParams, Link, useLocation} from "react-router-dom";
import {
    buildResourcePath,
    decodeResourceParam,
    findResourceBySlug,
    getAudiobookName,
    isEncodedApiUrl,
} from "../../utils/resourceRouting.js";
import ResourceReferenceLink from "./ResourceReferenceLink.jsx";

function GetAudiobookComponent() {
    const {slug} = useParams();
    const location = useLocation();
    const [audiobook, setAudiobook] = useState({});

    useEffect(() => {
        let ignore = false;

        async function load() {
            const stateUrl = location.state?.resourceUrl;
            if (stateUrl) {
                const resource = await fetchJSONfromAudiobook(stateUrl);
                if (!ignore) {
                    setAudiobook(resource);
                }
                return;
            }

            if (isEncodedApiUrl(slug)) {
                const link = decodeResourceParam(slug);
                const resource = await fetchJSONfromAudiobook(link);
                if (!ignore) {
                    setAudiobook(resource);
                }
                return;
            }

            const resource = await findResourceBySlug("audiobooks", slug, getAudiobookName);
            if (!ignore) {
                setAudiobook(resource);
            }
        }

        void load().catch(console.error);
        return () => {
            ignore = true;
        };
    }, [location.state, slug]);

    return (
        <div className="entity-table-wrapper">
            <table className="entity-table">
                <tbody>
                {Object.entries(audiobook).map(([key, value]) => (
                    <tr key={key}>
                        <th>{key}</th>
                        <td>{makeCellContent(key, value, audiobook)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

async function fetchJSONfromAudiobook(link) {
    let result = await fetch(link).then(response => {
        if (response.ok) {
            return response;
        } else {
            throw new Error('API call for audiobook details failed with status ' + response.status);
        }
    });
    return await result.json();
}

function makeCellContent(key, value, audiobook) {
    if (key === "genres") {
        return value.map((genreUrl) => (
            <div key={`${key}-${genreUrl}`}>
                <ResourceReferenceLink
                    resourceType="genres"
                    resourceUrl={genreUrl}
                    fallbackLabel={String(genreUrl)}
                />
            </div>
        ));
    }

    if (["reviews", "positions"].includes(key)) {
        return value.map((v) => (
            <div key={`${key}-${v}`}>
                <Link to={`/${key}/${encodeURIComponent(v)}`}>
                    {String(v)}
                </Link>
            </div>
        ));
    }

    if (key === "url") {
        return (
            <Link to={buildResourcePath("audiobooks", audiobook, getAudiobookName)} state={{resourceUrl: value}}>
                {String(value)}
            </Link>
        );
    }

    if (key === "index") {
        return (
            <Link to="/audiobooks">
                {String(value)}
            </Link>
        );
    }

    if (key === "authors") {
        return value.map((v) => <div key={`${key}-${v}`}>{String(v)}</div>);
    }

    if (key === "link") {
        return (
            <Link to={`${value}`}>
                {String(value)}
            </Link>
        );
    }

    return String(value);
}

export default GetAudiobookComponent;