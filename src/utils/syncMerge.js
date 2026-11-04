const timestampMillis = (value) => {
  if (!value) return 0;
  if (typeof value === 'string') return Date.parse(value) || 0;
  if (typeof value.toMillis === 'function') return value.toMillis();
  if (value.seconds) return value.seconds * 1000;
  return 0;
};

const recordKey = (item) => `${item.media_type}_${item.id}`;

export const mergeSyncedItems = (localItems = [], cloudItems = [], deleted = {}) => {
  const merged = new Map(localItems.map((item) => [recordKey(item), item]));
  const localDeletions = deleted || {};

  cloudItems.forEach((cloudItem) => {
    const key = cloudItem.firestoreId || recordKey(cloudItem);
    const localItem = merged.get(key);
    const deletionTime = timestampMillis(localDeletions[key]);
    const cloudTime = timestampMillis(cloudItem.updatedAt || cloudItem.deletedAt);
    const localTime = timestampMillis(localItem?.updatedAt);

    if (cloudItem.deleted) {
      if (cloudTime >= Math.max(localTime, deletionTime)) merged.delete(key);
      return;
    }

    if (deletionTime >= Math.max(localTime, cloudTime)) {
      merged.delete(key);
      return;
    }

    if (!localItem || cloudTime > localTime) merged.set(key, cloudItem);
  });

  return Array.from(merged.values());
};
