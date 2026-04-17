async function fetchIndex() {
  const result = await fetch("/api/").then((response) => {
    if (response.ok) {
      return response;
    }
    throw new Error(`API call for users failed with status ${response.status}`);
  });
  return result.json();
}

export default fetchIndex;

