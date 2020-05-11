var eventBus =  new Vue()

// Product component
Vue.component('product', {
    props: {
        premium: {
            type: Boolean,
            required: true
        }
    },
    template: `
         <div class="product">
            <div class="product-image">

                <a v-bind:href="link">
                    <img v-bind:src="image" alt="">
                </a>

            </div>
            <div class="product-info">

                <h1>{{ title }}</h1>

                <strong>{{ sale }}</strong>
                <p v-if='inStock'>In Stock</p>
                <p v-else :class="{ outOfStock: !inStock }">Out of Stock</p>

                <info-tabs 
                    :details="details"
                    :sizes="sizes"
                    :shipping="shipping">
                </info-tabs>
                
                <strong>Color:</strong>
                <div v-for='(variant, index) in variants' 
                    :key='variant.variantId' 
                    class="color-box"
                    :style="{ backgroundColor: variant.variantColor }"
                    @mouseover="updateProduct(index)">
                </div>

                <button @click='addToCart'
                    :disabled="!inStock"
                    :class="{ disabledButton: !inStock }">add</button>

                <button @click='removeFromCart'
                    :class="{ disabledButton: !inStock }">remove</button>
                
            </div>

            <product-tabs :reviews="reviews"></product-tabs>

        </div>   
    `,
    data() {
        return {
            brand: 'Vue Mastery',
            product: 'Socks',
            selectedVariant: 0,
            link: 'http://vuejs.com',
            //inStock: true,
            onSale: true,
            details: ['80% cotton', '20% polyester', 'stretch'],
            sizes: ['40', '41', '42'],
            variants: [
                {
                    variantId: 2244,
                    variantColor: 'green',
                    variantImage: 'vmSocks-green-onWhite.jpg',
                    variantQuantity: 0
                },
                {
                    variantId: 2245,
                    variantColor: 'blue',
                    variantImage: 'vmSocks-blue-onWhite.jpg',
                    variantQuantity: 5
                }
            ],
            reviews: []
        }
    },
    methods: {
        addToCart() {
            this.$emit('add-to-cart', this.variants[this.selectedVariant].variantId)
        },
        removeFromCart() {
            this.$emit('remove-from-cart', this.variants[this.selectedVariant].variantId)
        },
        updateProduct(index) {
            this.selectedVariant = index
            console.log(index)
        }
    },
    computed: {
        // title: function () {
        title() {
            return this.brand + ' ' + this.product
        },
        image() {
            return this.variants[this.selectedVariant].variantImage
        },
        inStock() {
            return this.variants[this.selectedVariant].variantQuantity
        },
        sale() {
            if (this.onSale) {
                return this.brand + ' ' + this.product + ' ' + 'is on sale!'
            } else {
                return this.brand + ' ' + this.product + ' ' + 'are not on sale.'
            }
        },
        shipping() {
            if (this.premium) {
                return 'FREE'
            } 
            return 2.99
        }
    },
    mounted() {
        eventBus.$on('review-submitted', productReview => {
            this.reviews.push(productReview)
        })
    }
})

// Product review component
Vue.component('product-review', {
    template: `
        <div>
  
        <form class="review-form" @submit.prevent="onSubmit">

            <p v-if="errors.length">
                <b>Please correct the error(s):</b>
                <ul>
                    <li v-for="error in errors">{{ error }}</li>
                </ul>
            </p>

            <p>
                <label for="name">Name:</label>
                <input id="name" v-model="name" placeholder="name">
            </p>

            <p>Do you recommend this product ?</p>
            
            <label>Yes</label>   
            <input type="radio" id="answer" v-model="recommend" value="Yes">

            <label>No</label>
            <input type="radio" id="answer" v-model="recommend" value="No">          
          
            <p>
                <label for="review">Review:</label>      
                <textarea id="review" v-model="review"></textarea>
            </p>
            
            <p>
                <label for="rating">Rating:</label>
                <select id="rating" v-model.number="rating">
                <option>5</option>
                <option>4</option>
                <option>3</option>
                <option>2</option>
                <option>1</option>
                </select>
            </p>
                
            <p>
                <input type="submit" value="Submit">  
            </p>    
            
            </form>
        </div>
    `,
    data() {
        return {
            name: null,
            review: null,
            rating: null,
            recommend: null,
            errors: []
        }
    },
    methods: {
        onSubmit() {
            if (this.name && this.rating && this.review && this.recommend) {
                let productReview = {
                    name: this.name,
                    review: this.review,
                    rating: this.rating,
                    recommend: this.recommend

                }              
                eventBus.$emit('review-submitted', productReview)
                this.name = null
                this.review = null
                this.rating = null  
                this.recommend = null
            }
            else {
                if(!this.name) this.errors.push('Name is required!')
                if(!this.rating) this.errors.push('Rating is required!')
                if(!this.review) this.errors.push('Review is required!')
                if (!this.recommend) this.errors.push('An answer is required!')
            }
        }
    }
})

Vue.component('info-tabs', {
    props: {
        shipping: {
            required: true
        },
        details: {
            type: Array,
            required: true
        },
        sizes: Array,
        required: true
    },
    template: `
        <div>
            <ul>
                <span class="tabs" 
                    :class="{activeTab: selectedTab === tab}"
                    v-for="(tab, index) in tabs"
                    @click="selectedTab = tab"
                    :key="tab"
                >{{ tab }}</span>
            </ul>

            <div v-show="selectedTab === 'Details'">
                <ul>
                    <li v-for="detail in details">
                        {{ detail }}
                    </li>
                </ul>           
            </div>

            <div v-show="selectedTab === 'Shipping'">
                <p>Shipping is: {{ shipping }}</p>
            </div>

            <div v-show="selectedTab === 'Sizes'">
                <ul>
                    <li v-for='size in sizes'>
                        {{ size }}
                    </li>
                </ul>
            </div>
        </div>
    `,
    data() {
        return {
            tabs: ['Details', 'Sizes', 'Shipping'],
            selectedTab: 'Details'
        }
    }
})

Vue.component('product-tabs', {
    props: {
        reviews: {
            type: Array,
            required: true
        }
    },
    template: `
       <div>
      
        <ul>
          <span class="tabs" 
                :class="{activeTab: selectedTab === tab}"
                v-for="(tab, index) in tabs"
                @click="selectedTab = tab"
                :key="tab"
            >{{ tab }}</span>
        </ul>

        <div v-show="selectedTab === 'Reviews'">
            <p v-if="!reviews.length">There are no reviews yet.</p>
            <ul v-else>
                <li v-for="(review, index) in reviews" :key="index">
                  <p>{{ review.name }}</p>
                  <p>Rating:{{ review.rating }}</p>
                  <p>{{ review.review }}</p>
                  <p>Do you recommend this product? {{ review.recommend }}</p>
                </li>
            </ul>
        </div>

        <div v-show="selectedTab === 'Make a Review'">
          <product-review></product-review>
        </div>
    
      </div>
    `,
    data() {
        return {
            tabs: ['Reviews', 'Make a Review'],
            selectedTab: 'Reviews'
        }
    }
})

var app = new Vue({
    el: '#app',
    data: {
        premium: true,
        cart: []
    },
    methods: {
        updateCart(id) {
            this.cart.push(id)
        },
        removeItem(id) {
            
            if (this.cart < 1) {
                alert('Your cart is empty')              
            } else {
                return this.cart.pop(id)
            }
        }
    }
    
})