import{isAuthenticated,getBackendActor,createAuthClient} from "./nonReactAuth"

export const addItemWrapped = async (authClient,item) => {
  try {
    const isAuth = await isAuthenticated(authClient);
    const backendActor = await getBackendActor(authClient);
    const principal = await authClient.getIdentity().getPrincipal();

    if(!isAuth){ return null}


    let result;
    // Creating a new item request
    const newItemRequest = {
      name: "Item name",
      cost: 100,
      available: true,
      category: "Demo",
      merchant: principal, // assuming the actor has a getPrincipal method
    };
    if(item){
        item["merchant"]=principal
         result = await backendActor.addNewItem(item);

    }else{
         result = await backendActor.addNewItem(newItemRequest);

    }
    // Calling addNewItem with the new item request

    // If the operation was successful, result will be an object with a 'ok' property
    if ('ok' in result) {
      console.log('Item added successfully with id:', result.ok);
      return Number(result.ok)
    } else if ('err' in result) {
      console.error('Failed to add item:', result.err);
    }
  } catch (error) {
    console.error('Failed to get the actor:', error);
  }
};


export async function addItem(item) {
  const authClient = await createAuthClient();

  // Call the addItem function and pass the authClient instance
  return await addItemWrapped(authClient);
}




export const addProfileWrapped = async (authClient, newProfile=null) => {
    try {
      const isAuth = await isAuthenticated(authClient);
      const backendActor = await getBackendActor(authClient);
      const principal = await authClient.getIdentity().getPrincipal();
        console.log("addProfile",isAuth,backendActor,principal)
      if (!isAuth) {
        return null;
      }

      // Create a demo profile if newProfile is not provided
      if (!newProfile) {
        newProfile = {
          profilePicture: [],
          name: "Demo User",
          description: "This is a demo profile.",
        };
      }

      // Create a new profile object
      const profileToAdd = {
        profilePicture: newProfile.profilePicture,
        name: newProfile.name,
        description: newProfile.description,
      };


      // Add the profile using the backend actor
      console.log("before profile add",profileToAdd)
      let result = await backendActor.addNewProfile(profileToAdd);
      console.log("result adding profile",result)

      return profileToAdd;
    } catch (error) {
      console.error('Failed to get the actor:', error);
      return null;
    }
  };


  export async function addProfile(profile) {
    console.log("in async wrapper addprofile")
    const authClient = await createAuthClient();
    // Call the addProfileWrapped function and pass the authClient instance
    return await addProfileWrapped(authClient,profile);
  }





  export const buyItemWrapped = async (authClient,item) => {
    try {
      const isAuth = await isAuthenticated(authClient);
      const backendActor = await getBackendActor(authClient);
      //const principal = await authClient.getIdentity().getPrincipal();

      if(!isAuth){ return null}


          let result;
           result = await backendActor.buyItem(item);

      // Calling addNewItem with the new item request

      // If the operation was successful, result will be an object with a 'ok' property
      if ('ok' in result) {
        console.log('Item added successfully with id:', result.ok);
        return result.ok;
      } else if ('err' in result) {
        console.error('Failed to add item:', result.err);
      }
    } catch (error) {
      console.error('Failed to get the actor:', error);
    }
  };


  export async function buyItem(item) {
    const authClient = await createAuthClient();

    // Call the addItem function and pass the authClient instance
    return await buyItemWrapped(authClient,item);
  }




  export const getItemWrapped = async (authClient,item) => {
    try {
      const isAuth = await isAuthenticated(authClient);
      const backendActor = await getBackendActor(authClient);
      //const principal = await authClient.getIdentity().getPrincipal();

      if(!isAuth){ return null}
          let result;
           result = await backendActor.getItem(item);

      // Calling addNewItem with the new item request

      // If the operation was successful, result will be an object with a 'ok' property
      if ('ok' in result) {
        console.log('Item added successfully with id:', result.ok);
        return result.ok;
      } else if ('err' in result) {
        console.error('Failed to add item:', result.err);
      }
    } catch (error) {
      console.error('Failed to get the actor:', error);
    }
  };


  export async function getItem(item) {
    const authClient = await createAuthClient();

    // Call the addItem function and pass the authClient instance
    return await getItemWrapped(authClient,item);
  }
