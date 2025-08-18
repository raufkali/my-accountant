import React from "react";

const Journal = () => {
  return (
    <div className="journal">
      <table class="table">
        <thead>
          <tr className="table-dark text-center">
            <th>#</th>
            <th>Buyer</th>
            <th>Seller</th>
            <th>Type</th>
            <th>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr class="text-center">
            <td>1</td>
            <td>Ali</td>
            <td>Ahmad</td>
            <td>Sell</td>
            <td>9000</td>
          </tr>
          <tr class="text-center">
            <td>2</td>
            <td>Khan</td>
            <td>Kamran</td>
            <td>Buy</td>
            <td>700</td>
          </tr>
          <tr class="text-center">
            <td>3</td>
            <td>Sami</td>
            <td>Jawad</td>
            <td>Sell</td>
            <td>100</td>
          </tr>
          <tr class="text-center">
            <td>4</td>
            <td>Kaleem</td>
            <td>sahil</td>
            <td>Buy</td>
            <td>2000</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default Journal;
