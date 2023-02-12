import { useState, useCallback } from 'react';
import useSWR from 'swr';
import CustomTag from '../models/custom-tag';
import TagProps from '../models/tag-props';

export default function useCustomTags() {
  const { data: customTags, mutate } = useSWR<CustomTag[]>('/api/customtags');

  const [unsavedTagged, setUnsavedTagged] = useState<string[]>([]);
  const [currentlyTagging, setCurrentlyTagging] = useState<TagProps | null>(null);
  const [showCustomTagPicker, setShowCustomTagPicker] = useState(false);
  const toggleShowCustomTagPicker = useCallback(() => {
    setShowCustomTagPicker(!showCustomTagPicker);
  }, [showCustomTagPicker]);
  const [disableEditTagsButton, setDisableEditTagsButton] = useState(false);

  const beginTagging = useCallback((tagId: string) => {
    if (customTags) {
      const tag = customTags.find(x => x.id === tagId);
      if (tag) {
        setUnsavedTagged([...tag.sounds]);
        setShowCustomTagPicker(false);
        setCurrentlyTagging(tag);
        setDisableEditTagsButton(true);
      }
    }
  }, [customTags]);

  const toggleSoundOnTag = useCallback((soundId: string) => {
    if (!currentlyTagging) return;
    let newTaggedSounds = [...unsavedTagged];
    if (newTaggedSounds.includes(soundId))
      newTaggedSounds = unsavedTagged.filter(x => (x !== soundId));
    else newTaggedSounds.push(soundId);
    setUnsavedTagged(newTaggedSounds);
  }, [currentlyTagging, unsavedTagged]);

  const saveTagged = useCallback(async () => {
    if (!customTags || !currentlyTagging) return;
    const tagIndex = customTags.findIndex(x => x.id === currentlyTagging?.id);
    if (customTags[tagIndex]) {
      const oldCurrentTagSounds = [...customTags[tagIndex].sounds];
      const newCustomTags = [...customTags];

      const deleted: string[] = [];

      unsavedTagged.forEach(newSound => {
        const oldTagWithSound = newCustomTags.find(oldTag => oldTag.sounds.includes(newSound));
        if (oldTagWithSound && oldTagWithSound.id !== currentlyTagging.id) {
          deleted.push(newSound);
          const soundOldIndex = oldTagWithSound.sounds.indexOf(newSound);
          const oldTagIndex = newCustomTags.indexOf(oldTagWithSound);
          newCustomTags[oldTagIndex].sounds.splice(soundOldIndex, 1);
        }
      });

      newCustomTags[tagIndex].sounds = [...unsavedTagged];

      const currentDeleted = oldCurrentTagSounds.filter(x => !unsavedTagged.includes(x));
      deleted.push(...currentDeleted);

      const updateTagSounds = async () => {
        const added = unsavedTagged.filter(x => !oldCurrentTagSounds.includes(x));
        const body = { addedId: currentlyTagging.id, added, deleted };
        await fetch('/api/customtags/editsounds', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        return newCustomTags;
      };
      mutate(updateTagSounds(), { optimisticData: newCustomTags, rollbackOnError: true });
      setCurrentlyTagging(null);
      setUnsavedTagged([]);
      setDisableEditTagsButton(false);
    }
  }, [customTags, currentlyTagging, unsavedTagged]);

  const discardTagged = useCallback(() => {
    setCurrentlyTagging(null);
    setUnsavedTagged([]);
    setDisableEditTagsButton(false);
  }, []);

  return {
    showCustomTagPicker,
    toggleShowCustomTagPicker,
    disableEditTagsButton,
    setDisableEditTagsButton,
    unsavedTagged,
    currentlyTagging,
    beginTagging,
    toggleSoundOnTag,
    saveTagged,
    discardTagged,
  };
}
