import React, { useContext } from "react"
import { v4 as uuidv4 } from "uuid"
import { useLocation, useNavigate } from 'react-router-dom'
import { UserContext } from "../UserContext"
import api from "../utils/api"

export default function Transaction() {
    
    // const usernam = useContext(UserContext)
    const { value, updateValue } = useContext(UserContext);
    const navigate = useNavigate();

    const dateAdded = new Date().toISOString()
    const [trans, setTrans] = React.useState({username: value, amount:0, category: "", type: "expense", date: dateAdded });
    
    const [options, setOptions] = React.useState(["food", "transport", "rent", "electricity", "taxes", "health"]);
    const [loading, setLoading] = React.useState(false);
    
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
    }, [fetchedId, fetchedAmount, fetchedCategory, fetchedType])

    
    
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
   

    async function handleSubmit(event) {
        event.preventDefault();
    
        if (value.length === 0) {
            alert('Login to create a transaction!');
            navigate("/login");
            return;
        }
    
        setLoading(true);
        try {
            if (!editMode) {
                const res = await api.post(`/transactions/add`, trans);
                console.log(res.data);
                document.getElementById("my-form").reset();
                alert('Transaction added successfully!');
            } else {
                const res = await api.put(`/transactions/${fetchedId}`, trans);
                console.log(res);
                setEditMode(false);
                document.getElementById("my-form").reset();
                navigate("/view");
            }
        } catch (error) {
            alert(error.response?.data?.message || 'Transaction failed');
        } finally {
            setLoading(false);
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

    const categoryOptions = options.map(opt => <option key={uuidv4()} value={opt}>{opt.charAt(0).toUpperCase() + opt.slice(1)}</option>)

    return (
        <div>
            <form id="my-form" className="my-form">
            <h3 className="form-heading">{editMode ? "Edit Transaction" : "Add New Transaction"}</h3>

            <select className="form-items type" name="category" id="category" value={trans.category} onChange={handleCategoryChange} required>
                <option value="">Select Category</option>
                {categoryOptions}
                <option value="addNew">+ Add New Category</option>
            </select>

            <br />
            <input className="form-items" id="amount" type="number" min={0} step="0.01" placeholder="Amount (₹)" value={trans.amount} onChange={handleAmountChange} required />
            <br />
        
            <select className="form-items type" name="type" id="type" onChange={handleTypeChange} value={trans.type} required>
                <option value="">Select Type</option>
                <option value="budget">💰 Income</option>
                <option value="expense">💸 Expense</option>
            </select>
            
            <button className="form-items submit-btn" onClick={handleSubmit} disabled={loading}>
                {loading ? "Processing..." : (editMode ? "Update Transaction" : "Add Transaction")}
            </button>
            
            </form>
            
        </div>
    
        
    )
}