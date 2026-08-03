import { DocVideo } from './DocVideo';

type PlatformVideosProps = {
  android: string;
  label: string;
  ios: string;
};

export function PlatformVideos({ android, ios, label }: PlatformVideosProps) {
  return (
    <div className="showcase-platform-videos">
      <section className="showcase-platform-video">
        <div className="showcase-platform-video-label">iOS</div>
        <DocVideo label={`${label} on iOS`} src={ios} />
      </section>
      <section className="showcase-platform-video">
        <div className="showcase-platform-video-label">Android</div>
        <DocVideo label={`${label} on Android`} src={android} />
      </section>
    </div>
  );
}
