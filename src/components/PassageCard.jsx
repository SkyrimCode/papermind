const PassageCard = ({ passage }) => {
  return (
    <div className="passage-card">
      <div className="passage-header">
        <span className="passage-icon">📖</span>
        <span className="passage-title">Read the following passage:</span>
      </div>
      <div className="passage-content">{passage}</div>
    </div>
  );
};

export default PassageCard;
