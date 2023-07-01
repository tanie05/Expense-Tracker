import React, { useContext } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import {UserContext} from '../UserContext'
import baseUrl from '../appConfig'
export default function TransactionList() {
 
  const { value } = useContext(UserContext);


  const [data, setData] = React.useState([]);
  const [displayData, setDisplayData] = React.useState([]);
  const [budget, setBudget] = React.useState(0)
  const [expense, setExpense] = React.useState(0)

  const fetchInfo = async () => { 
    const response = await axios.get(`${baseUrl}/transactions/${value}`);
    setData(response.data);
    setDisplayData(response.data);
  }
  
  React.useEffect(() => { 
        fetchInfo(); 
  }, [])
  React.useEffect(() => {
    setBudget(calculateBudget(displayData));
    setExpense(calculateExpense(displayData));
  }, [displayData]);

  const calculateBudget = (array) => {
    var val = 0
    for(var i = 0; i<array.length;i++){
      if(array[i].type === "budget"){
        val += array[i].amount
      }
    }
    return val;
  };

  const calculateExpense = (array) => {
    var val = 0
    for(var i = 0; i<array.length;i++){
      if(array[i].type === "expense"){
        val += array[i].amount
      }
    }
    return val;
  };
  const [typeFilter, setTypeFilter] = React.useState("");
  const [categoryFilter, setCatergoryFilter] = React.useState("");
  const handleTypeFilterChange = (event) => setTypeFilter(event.target.value)
  const handleCategoryFilterChange = (event) => setCatergoryFilter(event.target.value)

function handleFilterSubmit(event){
  event.preventDefault()
  let arr = []
  for(var i=0;i < data.length;i++){
      
      if(categoryFilter !== ""){
          if(categoryFilter !== data[i].category){
              continue;
          }
      }
      if(typeFilter !== ""){
          if(typeFilter !== data[i].type){
              continue;
          }
      }
      arr.push(data[i]);
      document.getElementById("filter-form").reset();
  }

  if(arr.length === 0){
      alert("No transactions from given filters")
  }
  setDisplayData([...arr])

}
function handleReset(event) {
  event.preventDefault();
  document.getElementById("filter-form").reset();
  setDisplayData([...data])
  setTypeFilter("")
  setCatergoryFilter("")
}
const handleDelete = async (id) => {
  try {
    const res = await axios.delete(`${baseUrl}/transactions/${id}`)
    console.log('Item successfully deleted.')
    window.location.reload(false)
  } catch (error) {
    alert(error)
  }
}



const listOfTransactions = displayData.map(trans => {

  let classNameIs = ""
  trans.type==="budget" ? classNameIs += "list-item budget": classNameIs += "list-item expense"
  return(
      <li key={trans._id} className= {classNameIs} >
      <table style= {{width:"100% "}}>
        <tbody>
        <tr>
              <td style= {{width:"50%"}}> {trans.category? trans.category:"Transaction"}</td>
              <td style={{width: "20%"}}>Rs. {trans.amount? trans.amount:0}</td>
              <td><button  className="del-btn submit-btn" onClick={() => handleDelete(trans._id)}>Delete</button></td>
              <td><Link className="edit-btn submit-btn" to= {`/?id=${trans._id}&amount=${trans.amount}&type=${trans.type}&category=${trans.category}`} >Edit</Link></td>
    
          </tr>
        </tbody>
          
      </table>
  </li>
  )
})
  return (
    <div className="listOfTrans">
      
      {displayData.length>0 &&<h1 className="history-heading">List of Transactions</h1>}
      <div className="totals">
            <h2 className="totals-budget">Total Earned   Rs.{budget}</h2>
            <h2 className="totals-expense">Total Expense   Rs.{expense}</h2>
      </div>
      
      {displayData.length>0
      &&<form className="filterform" id='filter-form'>
            <input className="filterformele form-items" type="text" placeholder="filter by category" value={categoryFilter} onChange={handleCategoryFilterChange} />
            <br/>
            <input className="filterformele form-items" type="text" placeholder="filter by type" value={typeFilter} onChange={handleTypeFilterChange} />
            <br/>
            <button className="filterformele form-items submit-btn" onClick = {handleFilterSubmit} >Find</button>
            <button className="filterformele form-items submit-btn" onClick = {handleReset} >Reset</button>
        </form>   
      } 
      <div className="list">{listOfTransactions}</div>          
    </div>
  )
}
