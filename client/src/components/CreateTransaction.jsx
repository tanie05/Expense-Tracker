import React from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
export default function Transaction(props) {
    

    const usernam = props.user
    const dateAdded = "2023-06-24T06:57:23.401Z"
    const [trans, setTrans] = React.useState({username: usernam, amount:0, category: "", type: "expense", date: dateAdded });
    
    const [options, setOptions] = React.useState(["food", "transport", "rent", "electricity", "taxes", "health"]);
    
    
    function handleAmountChange(event){
        setTrans(prevTrans => {
            return {...prevTrans, amount: event.target.value }
        })
    }
    function handleTypeChange(event){
        setTrans(prevTrans => {
            return {...prevTrans, type: event.target.value }
        })
    }
    // const fetchInfo = async () => { 
    //     const response = await axios.post(`http://5000/transactions/add`, trans);
    //     console.log(response.data) 
    //   }
    function handleSubmit(event){

        event.preventDefault()
        if(!usernam){
            alert('Login to create a transaction!')
            window.location = "/login"
        }
        
        axios.post('http://localhost:5000/transactions/add', trans)
        .then(res => console.log(res.data));
        document.getElementById("my-form").reset()
        
        
    }
    
    function addNewCategory()  {
        var newCategory = prompt("Enter new category: ")
        setOptions(prevOptions => [...prevOptions, newCategory])
        setTrans((prevTrans) => {return({...prevTrans, category: newCategory})})
    }
    function handleCategoryChange(event) {
        if(event.target.value === "addNew"){
            addNewCategory()
            return
        }
        setTrans(prevTrans => {
            return {...prevTrans, category: event.target.value }
        })
    }

    const categoryOptions = options.map(opt => <option key={uuidv4()} value = {opt} >{opt}</option>)

    return (
        <div>
            <form id="my-form" className="my-form">
            <h3 className="form-heading">Enter new transaction: </h3>

            <select className="form-items type" name="type" id="type" value={trans.category} onChange={handleCategoryChange } >
                <option value="" >Category</option>
            {categoryOptions}
            <option value = "addNew">Add a new category</option>
            </select>

            <br />
            <input className="form-items" id="amount" type="number" min={0} placeholder="Amount" value={trans.amount} onChange={handleAmountChange} />
            <br />
        
            <select className="form-items type" name="type" id="type" onChange={handleTypeChange}>
                
                <option>Type</option>
                <option value="budget">Budget</option>
                <option value="expense">Expense</option>
                
            </select>
            
            
            <button className="form-items submit-btn" onClick = {handleSubmit} >SUBMIT</button>
            
            </form>
            
        </div>
    
        
    )
}