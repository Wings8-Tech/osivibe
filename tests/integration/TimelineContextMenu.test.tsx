import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Timeline } from '../../src/components/Timeline';
import { useEditorStore } from '../../src/store/editorStore';
import { I18nProvider } from '../../src/i18n';
import type { TimelineClip } from '../../src/types';

vi.mock('../../src/hooks/use-responsive', () => ({
  useResponsive: () => ({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    foldState: 'flat',
    touchTargetSize: 44,
  }),
  useLayoutMode: () => 'desktop',
}));

const clip: TimelineClip = {
  id: 'clip-1',
  mediaId: 'media-1',
  trackId: 'video-1',
  startTime: 0,
  duration: 10,
  trimStart: 0,
  trimEnd: 0,
  name: 'sample.mp4',
  type: 'video',
};

const renderTimeline = () =>
  render(
    <I18nProvider>
      <Timeline />
    </I18nProvider>
  );

describe('Timeline clip context menu', () => {
  beforeEach(() => {
    localStorage.setItem('jemaos_lang', 'fr');
    useEditorStore.setState({
      mediaFiles: [
        {
          id: 'media-1',
          name: 'sample.mp4',
          type: 'video',
          file: new File([], 'sample.mp4'),
          url: 'blob:sample',
          duration: 10,
        },
      ],
      tracks: [
        { id: 'video-1', name: 'Video 1', type: 'video', clips: [clip], muted: false, locked: false, volume: 1 },
      ],
    });
    useEditorStore.getState().seek(5);
  });

  it('supprime le clip via le menu clic droit', async () => {
    const user = userEvent.setup();
    renderTimeline();
    fireEvent.contextMenu(screen.getByText('sample.mp4'));
    await user.click(screen.getByText('Supprimer'));
    expect(useEditorStore.getState().tracks[0].clips).toHaveLength(0);
  });

  it('coupe le clip au curseur via le menu clic droit', async () => {
    const user = userEvent.setup();
    renderTimeline();
    fireEvent.contextMenu(screen.getByText('sample.mp4'));
    await user.click(screen.getByText('Couper'));
    expect(useEditorStore.getState().tracks[0].clips).toHaveLength(2);
  });

  it('duplique le clip via le menu clic droit', async () => {
    const user = userEvent.setup();
    renderTimeline();
    fireEvent.contextMenu(screen.getByText('sample.mp4'));
    await user.click(screen.getByText('Dupliquer'));
    expect(useEditorStore.getState().tracks[0].clips).toHaveLength(2);
  });

  it('ferme le menu sur un clic exterieur', () => {
    renderTimeline();
    fireEvent.contextMenu(screen.getByText('sample.mp4'));
    expect(screen.getByText('Supprimer')).toBeInTheDocument();
    fireEvent.pointerDown(document.body);
    expect(screen.queryByText('Supprimer')).not.toBeInTheDocument();
  });
});
