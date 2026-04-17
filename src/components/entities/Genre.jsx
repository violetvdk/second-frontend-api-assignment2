import {useEffect, useState} from "react";
import {useParams, Link, useLocation} from "react-router-dom";
import {
    buildResourcePath,
    decodeResourceParam,
    findResourceBySlug,
    getGenreName,
    isEncodedApiUrl,
} from "../../utils/resourceRouting.js";
import ResourceReferenceLink from "./ResourceReferenceLink.jsx";

function GetGenreComponent() {
    const {slug} = useParams();
    const location = useLocation();
    const [genre, setGenre] = useState({});

    useEffect(() => {
        let ignore = false;

        async function load() {
            const stateUrl = location.state?.resourceUrl;
            if (stateUrl) {
                const resource = await fetchJSONfromGenre(stateUrl);
                if (!ignore) {
                    setGenre(resource);
                }
                return;
            }

            if (isEncodedApiUrl(slug)) {
                const link = decodeResourceParam(slug);
                const resource = await fetchJSONfromGenre(link);
                if (!ignore) {
                    setGenre(resource);
                }
                return;
            }

            const resource = await findResourceBySlug("genres", slug, getGenreName);
            if (!ignore) {
                setGenre(resource);
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
                {Object.entries(genre).map(([key, value]) => (
                    <tr key={key}>
                        <th>{key}</th>
                        <td>{makeCellContent(key, value, genre)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

async function fetchJSONfromGenre(link) {
    let result = await fetch(link).then(response => {
        if (response.ok) {
            return response;
        } else {
            throw new Error('API call for genre details failed with status ' + response.status);
        }
    });
    return await result.json();
}

function makeCellContent(key, value, genre) {
    if (key === "audiobooks") {
        return value.map((audiobookUrl) => (
            <div key={`${key}-${audiobookUrl}`}>
                <ResourceReferenceLink
                    resourceType="audiobooks"
                    resourceUrl={audiobookUrl}
                    fallbackLabel={String(audiobookUrl)}
                />
            </div>
        ));
    }

    if (key === "url") {
        return (
            <Link to={buildResourcePath("genres", genre, getGenreName)} state={{resourceUrl: value}}>
                {String(value)}
            </Link>
        );
    }

    if (key === "index") {
        return (
            <Link to="/genres">
                {String(value)}
            </Link>
        );
    }

    return String(value);
}

export default GetGenreComponent;