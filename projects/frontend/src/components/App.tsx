import React, { FC, useState, useCallback, useEffect } from 'react';
import useSWR from 'swr';
import styled, { ThemeProvider } from 'styled-components';
import Sound from '../models/sound';
import Nav from './nav/Nav';
import AdminPanel from './admin-panel/AdminPanel';
import Features from './features/Features';
import ButtonContainer from './ButtonContainer';
import SortContainer from './SortContainer';
import TagPicker from './custom-tags/TagPicker';
import * as themes from '../styles/themes';
import GlobalStyle from '../styles/global-style';
import Snowflakes from './decorative/Snowflakes';
import Fireworks from './decorative/Fireworks';
import useSortRules from '../hooks/use-sort-rules';
import useCustomTags from '../hooks/use-custom-tags';

const AppMain = styled.div`
  display: flex;
  flex-direction: column;
  position: relative;
  width: 100%;
  overflow-y: hidden;
`;

const Soundboard = styled.div`
  overflow-y: scroll;
  flex: 1;

  &::-webkit-scrollbar {
    width: 10px;
    height: 100vh;
  }

  &::-webkit-scrollbar-track {
    background: ${ props => props.theme.colors.innerB }
  }

  &::-webkit-scrollbar-thumb {
    background: ${ props => props.theme.colors.innerA };
  }
`;

function getThemeFromDate(date: string) {
  if (date.includes('July 4')) return themes.americaTheme;
  if (date.includes('Oct')) return themes.halloweenTheme;
  if (date.includes('Dec')) return themes.christmasTheme;
  return themes.defaultTheme;
}

const theme = getThemeFromDate(new Date().toString());

const App: FC = () => {
  const {
    sortRules,
    toggleSmallButtons,
    toggleFavs,
    setSearchTerm,
    toggleSoundSortOrder,
    toggleSoundGrouping,
    toggleTagFilter,
  } = useSortRules();

  const sounds = useSWR<Sound[]>('/api/sounds');

  const {
    customTags,
    mutateTags,
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
  } = useCustomTags();

  const [showAdminPanel, setShowAdminPanel] = useState(false);

  const [showPreview, setShowPreview] = useState(false);
  const toggleShowPreview = useCallback(() => {
    setShowPreview(!showPreview);
  }, [showPreview]);

  const [previewVolume, setPreviewVolume] = useState('.5');
  const [previewGain, setPreviewGain] = useState<GainNode | null>(null);
  useEffect(() => {
    if (previewGain)
      previewGain.gain.value = Number(previewVolume);
  }, [previewVolume, previewGain]);

  const previewRequest = useCallback(async (soundName: string) => {
    const soundUrl = await fetch(`/api/preview?soundName=${ soundName }`, { headers: { 'Content-Type': 'text/plain' } });
    const audioRes = await fetch(await soundUrl.text());
    const resBuffer = await audioRes.arrayBuffer();
    const context = new AudioContext();
    const gain = context.createGain();

    setPreviewGain(gain);

    await context.decodeAudioData(resBuffer, buffer => {
      const source = context.createBufferSource();
      source.buffer = buffer;
      source.connect(gain).connect(context.destination);
      source.start(0);
    });
  }, [previewVolume]);

  return (
    <AppMain>
      <ThemeProvider theme={ theme }>
        <GlobalStyle />
        { theme.name === 'america' && <Fireworks /> }
        { (theme.name === 'christmas' || theme.name === 'halloween') && <Snowflakes /> }
        <Nav showAdminPanel={ showAdminPanel } setShowAdminPanel={ setShowAdminPanel } />
        { showAdminPanel ? <AdminPanel sounds={ sounds } /> : (
          <Soundboard>
            <Features
              favoritesToggled={ sortRules.favorites }
              toggleFavs={ toggleFavs }
              previewToggled={ showPreview }
              toggleShowPreview={ toggleShowPreview }
              showCustomTagPicker={ showCustomTagPicker }
              toggleShowCustomTagPicker={ toggleShowCustomTagPicker }
              customTagProps={ customTags?.map(x => ({ id: x.id, name: x.name, color: x.color })) }
              toggleSoundGrouping={ toggleSoundGrouping }
              toggleTagFilter={ toggleTagFilter }
              disableEditTagsButton={ disableEditTagsButton }
              setSearchTerm={ setSearchTerm }
              soundSortOrder={ sortRules.sortOrder }
              toggleSoundSortOrder={ toggleSoundSortOrder }
            />
            <SortContainer
              showPreview={ showPreview }
              toggleSmallButtons={ toggleSmallButtons }
              setPreviewVolume={ setPreviewVolume }
              currentlyTagging={ currentlyTagging }
              saveTagged={ saveTagged }
              discardTagged={ discardTagged }
            />
            { showCustomTagPicker && (
            <TagPicker
              customTags={ customTags ?? [] }
              mutateTags={ mutateTags }
              setDisableEditTagsButton={ setDisableEditTagsButton }
              beginTagging={ beginTagging }
            />
            ) }
            <ButtonContainer
              sounds={ sounds }
              preview={ showPreview }
              previewRequest={ previewRequest }
              sortRules={ sortRules }
              customTags={ customTags ?? [] }
              currentlyTagging={ currentlyTagging }
              unsavedTagged={ unsavedTagged }
              toggleSoundOnTag={ toggleSoundOnTag }
            />
          </Soundboard>
        )}
      </ThemeProvider>
    </AppMain>
  );
};

export default App;
