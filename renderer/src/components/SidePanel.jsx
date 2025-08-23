import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTachometerAlt,
  faShoppingCart,
  faExchangeAlt,
  faUser,
} from "@fortawesome/free-solid-svg-icons"; // Import needed icons
import "./SidePanel.css";

const SidePanel = () => {
  return (
    <div className="sidebar bg-dark text-white">
      <h4 className="sidebar-brand mt-4">My-Accountant</h4>
      <div className="row mt-5">
        <ul className="col-12 navbar-nav navbar-dark text-light h5 gap-2">
          <li className="nav-item">
            <Link to="/" className="nav-link active">
              <FontAwesomeIcon icon={faTachometerAlt} className="me-2" />
              Dashboard
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/orders" className="nav-link">
              <FontAwesomeIcon icon={faShoppingCart} className="me-2" />
              Orders
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/transactions" className="nav-link">
              <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
              Transactions
            </Link>
          </li>

          <li className="nav-item">
            <Link to="/accounts" className="nav-link">
              <FontAwesomeIcon icon={faUser} className="me-2" />
              Accounts
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default SidePanel;
