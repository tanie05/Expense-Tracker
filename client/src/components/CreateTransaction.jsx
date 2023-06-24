import React from "react";
import { v4 as uuidv4 } from "uuid";
import axios from "axios";
import { useLocation } from 'react-router-dom';
import {UserContext} from "../UserContext"
import { useContext } from "react";

export default function Transaction() {
    
    // const usernam = useContext(UserContext)
    const { value, updateValue } = useContext(UserContext);

    const dateAdded = "2023-06-24T06:57:23.401Z"
    const [trans, setTrans] = React.useState({username: value, amount:0, category: "", type: "expense", date: dateAdded });
    
    const [options, setOptions] = React.useState(["food", "transport", "rent", "electricity", "taxes", "health"]);
    
    const location = useLocation();
    const queryParams = new URLSearchParams(location.search);

    const [editMode, setEditMode] = React.useState(false);

    const fetchedId = queryParams.get('id');
    const fetchedAmount = queryParams.get('amount');
    const fetchedType = queryParams.get('type');
    const fetchedCategory = queryParams.get('category');
    
    React.useEffect(()=>{
        if(fetchedId){
            setEditMode(true)
            setTrans((prevTrans) => {
                return {...prevTrans, amount: fetchedAmount, category: fetchedCategory, type: fetchedType}
            })
        }
    }, [])

    
    
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
   

    function handleSubmit(event){

        event.preventDefault()
        if(value.length === 0){
            alert('Login to create a transaction!')
            window.location = "/login"
        }
        if(!editMode){
            axios.post('http://localhost:5000/transactions/add', trans)
            .then(res => console.log(res.data));
            document.getElementById("my-form").reset()
        }
        else{
            axios.put(`http://localhost:5000/transactions/${fetchedId}`, trans)
            .then(res => console.log(res))
            setEditMode(false)
            document.getElementById("my-form").reset();
            window.location = "/view";
        }
        
        
        
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
        
            <select className="form-items type" name="type" id="type" onChange={handleTypeChange} value={trans.type} >
                
                <option>Type</option>
                <option value="budget">Budget</option>
                <option value="expense">Expense</option>
                
            </select>
            
            
            <button className="form-items submit-btn" onClick = {handleSubmit} >{editMode?"Edit":"submit"}</button>
            
            
            </form>
            
        </div>
    
        
    )
}