export const pushOrSet = <K, V>(map: Map<K, V[]>, key: K, value: V) => {
	const existing = map.get(key);
	if (existing) {
		existing.push(value);
	} else {
		map.set(key, [value]);
	}
};