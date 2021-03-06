import React, {Component} from 'react';
import { connect } from 'react-redux';
import { StyleSheet, Text, View,TextInput,Picker,Button, TouchableOpacity, ScrollView } from 'react-native';
import { Actions } from 'react-native-router-flux';
import VendorLogout from './LogoutVendor';
import axios from 'axios';
import {baseURL} from '../../config/constants.js';

class chooseCat extends Component {
  constructor(props){
      super(props);
      this.state={
          list:null,
          category_id:null,
          subcat_id:null,
          formIsValid:false,
          categories:null,
          subcategories:null,
          price:0,
          present:false
      }
      this.handleCategory=this.handleCategory.bind(this);
      this.handlePrice=this.handlePrice.bind(this);
      this.handleSubcategory=this.handleSubcategory.bind(this);
      this.submitHandler=this.submitHandler.bind(this);
  }

  componentDidMount(){
      setTimeout(()=>{
          axios.get(baseURL+'/categories')
              .then((response)=>{
                  this.setState({
                      categories:response.data
                  });
                  if(this.state.categories && this.state.categories.length){
                      axios.get(baseURL+'/categories/'+this.state.categories[0].key+'/subcat')
                          .then((response)=>{
                              this.setState({
                                  subcategories:response.data,
                                  category_id:this.state.categories[0].key,
                                  subcat_id:response.data[0].key
                              })
                          })
                          .then(()=>{
                            // Headers
                            const config = {
                                headers: {
                                'Content-type': 'application/json'
                                }
                            };
                            axios.get(baseURL+'/vendor/selections/'+this.props.vendorData.selection_id,config)
                                .then(res=>{
                                    this.setState({
                                        list:res.data
                                    })
                                })
                                .catch(e=>{
                                    console.log(e);
                                })
                          })
                          .catch((error)=>{
                              console.log(error);
                          })
                  }
              })
              .catch((error)=>{
                  console.log(error);
              })
      },500);
  }

  componentDidUpdate(prevProps) {
      if(!this.props.isLoading&&!this.props.isAuthenticated){
        this.props.history.push('/vendor/login');
      }
      const { error } = this.props;
      if (error !== prevProps.error) {
        // Check for register error
        if (error.id === 'VENDOR_REGISTER_FAIL') {
          this.setState({ msg: error.msg.msg });
        } else {
          this.setState({ msg: null });
        }
      }
    }

  handleCategory(){
      let curid=this.state.category_id;
      axios.get(baseURL+'/categories/'+curid+'/subcat')
          .then((response)=>{
              if(response.data&&response.data.length){
                  this.setState({
                      subcategories:response.data ,
                      category_id:curid,
                      subcat_id:response.data[0].key,
                      present:false
                  });
              }else{
                  this.setState({
                      subcategories:response.data ,
                      category_id:curid,
                      subcat_id:null,
                      present:false
                  });
              }
          })
          .catch((error)=>{
              console.log(error);
          })
  }

  
  handlePrice(event){
      this.setState({
          price:event.target.value
      });
  }
  
  handleSubcategory(event){
      let curid=event.target.value;
      this.setState({
          subcat_id:curid,
          present:false
      });
      
  }

  // deleteHandler(id){
  //   if(this.props.isAuthenticated){
  //     // Headers
  //     const config = {
  //         headers: {
  //         'Content-type': 'application/json'
  //         }
  //     };
  //     axios.delete( baseURL+'/vendor/selections/'+id,config)
  //         .then(res => {
  //             this.setState({
  //               list:res.data,
  //               present:false
  //             })
  //         })
  //         .catch(e=>{
  //             console.log("category add request failed.retry later"+e)
  //         });
  //   }
  // }

  submitHandler(event){
    event.preventDefault();
    var filtered=this.state.list.filter(subcat=>{
      return subcat.subcat_id._id===this.state.subcat_id
    })
    if(filtered&&filtered.length){
      this.setState({
        present:true
      })
      return ;
    }
    if(this.props.isAuthenticated){
      // Headers
      const config = {
          headers: {
          'Content-type': 'application/json'
          }
      };
      const item = JSON.stringify({
        vendorid:this.props.vendorData._id,
        subcat_id:this.state.subcat_id,
        price:this.state.price
      });
      console.log(item)
      axios.post( baseURL+'/vendor/selections/'+this.props.vendorData.selection_id, item ,config)
          .then(res => {
              this.setState({
                list:res.data,
                present:false
              })
          })
          .catch(e=>{
              console.log("category add request failed.retry later",e)
          });
    }
  }

      render(){
          return (
            <ScrollView style = {styles.container}>
            <View>
              <View>
                    {this.state.present? (<Text>Item already present in the list</Text>):null}
                </View>
              {this.props.isAuthenticated ? (
                <View>
                    <VendorLogout/>
                    <Text onPress={() => Actions.vendorProfile()}>Done Adding!</Text>
                    {
                this.state.categories ? (
                <View >
                    <Picker 
                     selectedValue={this.state.category_id} 
                     onValueChange={(itemValue, itemIndex) => {this.setState({category_id: itemValue});
                     console.log("picker change")
                     console.log(this.state.subcategories)
                     }}>
                        {
                            this.state.categories.map(category=>{
                                return(
                                <Picker.Item label={category.name} value={category.id} key={category.name}/>
                                );
                            })
                            
                        }
                    </Picker >
                    {<Button title="Click Here To Get Picker Selected Value" onPress={ this.handleCategory } />}
                    {
                        this.state.subcategories ?(
                        <Picker 
                        onValueChange={(itemValue, itemIndex) => this.setState({subcat_id: itemValue})} 
                        selectedValue={this.state.subcat_id}>
                            {
                                this.state.subcategories.map(subcategory=>{
                                    return(
                                    <Picker.Item label={subcategory.name} value={subcategory.id} key={subcategory.name}/>);
                                })
                            }
                        </Picker>)
                            :<Text>No sub-category</Text>
                    }
                            <View style = {styles.row}>
                              <Text style = {styles.text1}>Price:</Text>
                              <TextInput
                                style = {styles.input}
                                underlineColorAndroid = "transparent"
                                placeholder = "Price"
                                placeholderTextColor = "#9a73ef"
                                autoCapitalize = "none" 
                                keyboardType = "numeric"
                                value={this.props.price}
                                onChangeText={(price) => this.setState({ price })}
                                />
                                <Text>Rs.</Text>
                            </View>
                          <TouchableOpacity style = {styles.add} onPress={this.submitHandler}><Text>ADD</Text></TouchableOpacity>
                          </View> ) : null
                    //     <Text onPress={this.submitHandler}>ADD</Text>
                    // </View> ) : null
                }
                <View>
                    {
                      this.state.list&&this.state.list.length ?(
                        <View>
                          {
                            this.state.list.map(selected=>(
                              <View style = {styles.align} key={selected._id}>
                                <View style = {styles.view}>
                                <Text style = {styles.size}>Category</Text>
                                <Text style = {styles.view1}>{selected.subcat_id.cat_id.name}</Text>
                              </View>
                              <View style = {styles.view}>
                                <Text style = {styles.size}>Sub-category</Text>
                                <Text style = {styles.view1}>{selected.subcat_id.name}</Text>
                              </View>
                              <View style = {styles.view}>
                                <Text style = {styles.size}>Price</Text>
                                <Text style = {styles.view1}>{selected.price}  {selected.subcat_id.quantity_type}</Text>
                              </View>
                                <TouchableOpacity style = {styles.button} onPress={()=>this.deleteHandler(selected._id)}>
                                <Text style = {styles.text}>Delete</Text>
                                </TouchableOpacity>
                                {/* <Text>Category:{selected.subcat_id.cat_id.name}</Text>
                                <Text>Sub-category:{selected.subcat_id.name}</Text>
                                <Text>Price:{selected.price}  {selected.subcat_id.quantity_type}</Text>
                                <Text onPress={()=>this.deleteHandler(selected._id)}>Delete</Text> */}
                              </View>
                            ))
                          }
                        </View>
                      ):(
                        <Text>You have selected no prefered category</Text>
                      )
                    }
                </View>
                {/* <TouchableOpacity onPress={() => Actions.vendorProfile()}><Text style = {styles.done}>Done!</Text></TouchableOpacity> */}
            </View>
            ) : (
                <Text>Please Login First!</Text>
              )}
            </View>
            </ScrollView>
        );
      }
}

const styles = StyleSheet.create({
  container : {
       backgroundColor : 'white',
       flex : 1,
       margin : 10
 },
  input: {
     marginLeft: 5,
     marginRight : 15,
     height : 40,
     borderColor: '#7a42f4',
     borderWidth: 1,
     backgroundColor : 'white',
     paddingLeft : 10,
     marginBottom : 20,
     borderRadius : 10,
     width : 250,
  },
   done : {
     fontSize : 30,
     textAlign : 'center',
     color : 'red'
 },
 text1 : {
     fontSize : 20,   
 },
 size : {
     fontSize : 18,
     fontWeight : 'bold'
 },
 view : {
     flexDirection : 'row',
     justifyContent : 'space-between',
 },
  button : {
     borderWidth : 1,
     borderColor : '#5cc2f2',
     backgroundColor : '#5cc2f2',
     padding : 10,
     borderRadius : 5,
     marginBottom : 10,
     width : 100,
     marginLeft : 110,
     paddingLeft : 28,
     marginTop : 10
   },
   align : {
     borderColor : 'black',
     borderWidth : 1,
     borderRadius : 10,
     padding : 10,
     marginTop : 5,
     shadowColor : 'black',
     shadowOpacity : 0.5,
     backgroundColor : '#f7f8fa',
     margin : 10
 },
   text : {
     fontWeight : 'bold'
  },
  add : {
     borderWidth : 1,
     borderColor : '#5cc2f2',
     backgroundColor : '#5cc2f2',
     padding : 10,
     borderRadius : 5,
     marginBottom : 10,
     width : 100,
     marginLeft : 130,
     paddingLeft : 35
  }, 
  view1 : {
     fontSize : 18   
 },
 row : {
      flexDirection : 'row',
      marginLeft : 10
  },
});

const mapStateToProps = state => ({
    token:state.vendorAuth.token,
    vendorData:state.vendorAuth.vendor,
    isAuthenticated: state.vendorAuth.isAuthenticated,
    error: state.error
  });

export default connect(mapStateToProps,null)(chooseCat);
  
