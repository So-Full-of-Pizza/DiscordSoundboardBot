import React, { FC, useCallback } from 'react';
import styled, { css } from 'styled-components';
import theme from '../styles/main';

const sliderThumb = css`
  -webkit-appearance: none;
  height: 20px;
  width: 20px;
  border-radius: 50%;
  background: #6b54fc;
  cursor: ew-resize;
  box-shadow: 0 0 2px 0 #555;
`;

const PreviewInstructionsMain = styled.div`
  color: ${ theme.colors.borderDefault };
  display: flex;
  align-items: center;
  justify-content: left;
  flex-grow: 2;

  > p {
    margin: 0;
  }

  > input[type="range"] {
    -webkit-appearance: none;
    margin-left: 15px;
    height: 7px;
    background: rgba(255, 255, 255, 0.6);
    border-radius: 5px;
    background-image: linear-gradient(#816eff, #816eff);
    background-size: 25%;
    background-repeat: no-repeat;
  }
  
  > input[type="range"]::-webkit-slider-thumb {
    ${ sliderThumb }
  }
  
  > input[type=range]::-webkit-slider-runnable-track {
    -webkit-appearance: none;
    box-shadow: none;
    border: none;
    background: transparent;
  }

  > input[type="range"]::-moz-range-thumb {
    ${ sliderThumb }
  }
`;

interface PreviewInstructionsProps {
  setPreviewVolume: (volume: string) => void;
}

const PreviewInstructions: FC<PreviewInstructionsProps> = ({ setPreviewVolume }) => {
  const animateVolumeInput = useCallback((event: React.FormEvent<HTMLInputElement>) => {
    const min = Number(event.currentTarget.min);
    const max = Number(event.currentTarget.max);
    event.currentTarget.style.backgroundSize = `${ ((Number(event.currentTarget.value) - min) * 100) / (max - min) }% 100%`;
  }, []);

  return (
    <PreviewInstructionsMain>
      <p>Sounds will only play through your browser</p>
      <input
        type="range"
        min={ 0 }
        max={ 2 }
        defaultValue=".5"
        step="0.01"
        onInput={ event => {
          setPreviewVolume(event.currentTarget.value);
          animateVolumeInput(event);
        } }
      />
    </PreviewInstructionsMain>
  );
};

export default PreviewInstructions;
