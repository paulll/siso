export const getOrCreate = <K, V>(map: Map<K, V[]>, key: K) => {
	const existing = map.get(key);
	if (existing) {
		return existing;
	} else {
		const created = [];
		map.set(key, created);
		return created;
	}
};