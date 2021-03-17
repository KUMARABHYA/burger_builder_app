import React, { Component } from 'react';


import Aux from '../../hoc/Aux';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from '../../axios.orders';
// import OderSummary from '../../components/Burger/OrderSummary/OderSummary';


const INGREDIENT_PRICES = {
    salad: 15,
    cheese: 25,
    meat: 30,
    bacon: 20
}
class BurgerBuilder extends Component {
    // constructor(props) {
    //     super(props) ;
    //     this.state = {...}

        
    // }
    state = {
        ingredients: null,
        totalPrice: 20,
        purchasable: false,
        purchasing: false,
        loading: false,
        error:null
    }
    componentDidMount () {
        axios.get('https://burger-builder-adc9f-default-rtdb.firebaseio.com/ingredients.json')
        .then(response => {
            this.setState({ingredients: response.data});
        })
        .catch(error => {
            this.setState({error: true})
        });
        

    }

    updatePurchaseState (ingredients) {   
        const sum = Object.keys(ingredients)
          .map(igKey => {
              return ingredients[igKey];
          })
          .reduce((sum, el) => {
              return sum + el;
          }, 0);
          this.setState({purchasable: sum > 0});
    }

    addIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        const updatedCount = oldCount + 1;
        const updateIngredients = {
            ...this.state.ingredients
        };
        updateIngredients[type] = updatedCount;
        const priceAddition = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice + priceAddition;
        this.setState({totalPrice: newPrice, ingredients: updateIngredients});
        this.updatePurchaseState(updateIngredients);

    }
    removeIngredientHandler = (type) => {
        const oldCount = this.state.ingredients[type];
        if(oldCount <= 0){
            return;
        }
         
        const updatedCount = oldCount - 1;
        const updateIngredients = {
            ...this.state.ingredients
        };
        updateIngredients[type] = updatedCount;
        const priceDeduction = INGREDIENT_PRICES[type];
        const oldPrice = this.state.totalPrice;
        const newPrice = oldPrice - priceDeduction;
        this.setState({totalPrice: newPrice, ingredients: updateIngredients});
        this.updatePurchaseState(updateIngredients);

    }
    purchaseHandler = () => {
        this.setState({purchasing: true});
    }
    purchaseCancelHandler = () => {
        this.setState({purchasing: false});
    }
    purchaseContinueHandler = () => {
        // alert('you continue!');
        this.setState( { loading: true } );
        const order = {
            ingredients: this.state.ingredients,
            price:this.state.totalPrice,
            customer: {
                name: 'Abhya',
                address: {
                    street: 'Street 1',
                    zipCode: '201301',
                    country: 'India'
                },
                email:'Abhya@gmail.com'
            },
            deliveryMethod: 'fastest'
        }
        axios.post('/orders.json', order)
        .then(response => {
            this.setState({ loading: false, purchasing: false });
        })
        .catch(error => {
            this.setState({ loading: false, purchasing: false });
        } );
    }
    render() {
        const disabledInfo = {
            ...this.state.ingredients
        };
        for (let key in disabledInfo) {
            disabledInfo[key] = disabledInfo[key] <= 0 
        }
        let orderSummary = null;
       
       
        let burger = this.state.error ? <p>ingredients can't be loaded! </p> : <Spinner />;
        if (this.state.ingredients) {
            burger = (
                <Aux>   
                    <Burger ingredients={this.state.ingredients} />       
                    <BuildControls  
                       ingredientAdded={this.addIngredientHandler}
                       ingredientRemove={this.removeIngredientHandler}
                       disabled={disabledInfo}
                       purchasable={this.state.purchasable}
                       ordered={this.purchaseHandler}
                       price={this.state.totalPrice} />
               </Aux>
               );
               orderSummary = <OrderSummary
               ingredients={this.state.ingredients}
               price={this.state.totalPrice}
               purchaseCancelled={this.purchaseCancelHandler}
               purchaseContinued={this.purchaseContinueHandler} />;
        }
        if (this.state.loading){
            orderSummary = <Spinner />;

        }
       
        return (
            <Aux>
                <Modal show={this.state.purchasing} modalClosed={this.purchaseCancelHandler}>
                    {orderSummary}
                </Modal>
                {burger}
                
            </Aux>

        );
    }
}
export default withErrorHandler(BurgerBuilder, axios);