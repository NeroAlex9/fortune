import React, { useEffect, useState } from 'react'
import { setSliceName, setSlicePrizes, setSliceWeight } from './store/slice'
import { useDispatch } from 'react-redux'
import { NavLink } from 'react-router-dom'


const Input = () => {
  const dispatch = useDispatch()
  const [name, setName] = useState('')
  const [weight, setWeight] = useState(0)
  const [prize, setPrize] = useState('')
  let updateSlice=()=>{
    dispatch(setSliceName(name));
    dispatch(setSliceWeight(weight))
    dispatch(setSlicePrizes(prize));
    
  }
  useEffect(()=>{
    updateSlice()
  },[name, weight, prize])

    

  return (
    <div>
        <p>Название приза: </p>
        <input placeholder='Введите название'
        value={name}
        onChange={e=>setName(e.target.value)}
        ></input>

        <p>Процент выпадения приза </p>
        <input placeholder='Введите число от 1 до 100'
        value={weight}
        onChange={e=>setWeight(e.target.value)}
        ></input>

        <p>Введи промокоды </p>
        <input placeholder='Введи промокод'
        value={prize}
        onChange={e=>setPrize(e.target.value)}
        ></input>

        <button>Добавить приз</button>
        <NavLink to={'/'}>
        <button>Вернуться в меню</button>
        </NavLink>
        
    </div>
    
  )
}

export default Input