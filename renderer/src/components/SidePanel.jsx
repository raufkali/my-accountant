import { Link } from "react-router-dom";
import "./SidePanel.css";
const SidePanel = () => {
  return (
    <div className="sidebar bg-dark text-white">
      <h4 className="sidebar-brand mt-4">My-Accountant</h4>
      <div className="row mt-5">
        <ul className="col-12 navbar-nav navbar-dark text-light h5 gap-2">
          <li className="nav-item">
            <Link to="/" className="nav-link active">
              Dashboard
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/persons" className="nav-link">
              Persons
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/orders" className="nav-link">
              Orders
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/transactions" className="nav-link">
              Transactions
            </Link>
          </li>
          <li className="nav-item">
            <Link to="/accounts" className="nav-link">
              Accounts
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidePanel;
