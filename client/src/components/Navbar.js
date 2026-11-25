function Navbar(props) {
  return (
    <header className="navbar">
      <div className="brand">
        <span className="brand-mark"></span>
        <span className="brand-name">Women in STEM Mentorship</span>
      </div>
      {props.user && (
        <div className="navbar-right">
          <span className="avatar">{props.user.name.charAt(0).toUpperCase()}</span>
          <span className="navbar-name">
            {props.user.name}
            <small>{props.user.role}</small>
          </span>
          <button className="small-button outline-button" onClick={props.onLogout}>
            Log out
          </button>
        </div>
      )}
    </header>
  );
}

export default Navbar;
