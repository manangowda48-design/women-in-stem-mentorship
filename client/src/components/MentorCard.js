// Shows one mentor profile as a card
function MentorCard(props) {
  const mentor = props.mentor;

  return (
    <div className="card">
      <div className="card-top">
        <span className="avatar">{mentor.userId.name.charAt(0).toUpperCase()}</span>
        <div>
          <h4>{mentor.userId.name}</h4>
          <p className="muted">{mentor.experience}</p>
        </div>
      </div>

      <div className="chips">
        {mentor.expertise.map((item) => (
          <span className="chip" key={item}>
            {item}
          </span>
        ))}
      </div>

      <p className="card-bio">{mentor.bio}</p>

      {props.requestStatus === "" ? (
        <button className="small-button" onClick={() => props.onRequest(mentor.userId._id)}>
          Send request
        </button>
      ) : (
        <span className={"badge " + props.requestStatus}>Request {props.requestStatus}</span>
      )}
    </div>
  );
}

export default MentorCard;
