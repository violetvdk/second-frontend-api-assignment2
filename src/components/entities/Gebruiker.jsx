import {useEffect, useState} from "react";
import {useParams, Link, useLocation} from "react-router-dom";
import {
    buildResourcePath,
    decodeResourceParam,
    findResourceBySlug,
    getUserName,
    isEncodedApiUrl,
} from "../../utils/resourceRouting.js";

function GetUserComponent() {
    const {slug} = useParams();
    const location = useLocation();
    const [user, setUser] = useState({});

    useEffect(() => {
        let ignore = false;

        async function load() {
            const stateUrl = location.state?.resourceUrl;
            if (stateUrl) {
                const resource = await fetchJSONfromUser(stateUrl);
                if (!ignore) {
                    setUser(resource);
                }
                return;
            }

            if (isEncodedApiUrl(slug)) {
                const link = decodeResourceParam(slug);
                const resource = await fetchJSONfromUser(link);
                if (!ignore) {
                    setUser(resource);
                }
                return;
            }

            const resource = await findResourceBySlug("users", slug, getUserName);
            if (!ignore) {
                setUser(resource);
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
                {Object.entries(user).map(([key, value]) => (
                    <tr key={key}>
                        <th>{key}</th>
                        <td>{makeCellContent(key, value, user)}</td>
                    </tr>
                ))}
                </tbody>
            </table>
        </div>
    );
}

async function fetchJSONfromUser(link) {
    let result = await fetch(link).then(response => {
        if (response.ok) {
            return response;
        } else {
            throw new Error('API call for user details failed with status ' + response.status);
        }
    });
    return await result.json();
}

function makeCellContent(key, value, user) {
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
            <Link to={buildResourcePath("users", user, getUserName)} state={{resourceUrl: value}}>
                {String(value)}
            </Link>
        );
    }

    if (key === "index") {
        return (
            <Link to="/users">
                {String(value)}
            </Link>
        );
    }

    return String(value);
}

export default GetUserComponent;