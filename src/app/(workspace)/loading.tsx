export default function WorkspaceLoading() {
    return <div className="loading-stack" aria-label="Loading workspace">
    <div className="skeleton skeleton--title"/>
    <div className="skeleton-metrics">{Array.from({ length: 4 }).map((_, index) => <div className="skeleton skeleton--metric" key={index}/>)}</div>
    <div className="skeleton skeleton--panel"/>
    <div className="skeleton skeleton--panel"/>
  </div>;
}
