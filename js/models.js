"use strict";

//taken from api

const BASE_URL = "https://hack-or-snooze-v3.herokuapp.com";

/******************************************************************************
 * Story: a single story in the system
 */

class Story {

  /** Make instance of Story from data object about story:
   *   - {title, author, url, username, storyId, createdAt}
   */

  constructor({ storyId, title, author, url, username, createdAt }) {
    this.storyId = storyId;
    this.title = title;
    this.author = author;
    this.url = url;
    this.username = username;
    this.createdAt = createdAt;
  }

  /** Parses hostname out of URL and returns it. */

  getHostName() {
    // UNIMPLEMENTED: complete this function!
    const url = new URL(this.url);
    const hostName = url.hostname;

    return hostName;
  }
}


/******************************************************************************
 * List of Story instances: used by UI to show story lists in DOM.
 */

class StoryList {
  constructor(stories) {
    this.stories = stories;
  }

  /** Generate a new StoryList. It:
   *
   *  - calls the API
   *  - builds an array of Story instances
   *  - makes a single StoryList instance out of that
   *  - returns the StoryList instance.
   */

  static async getStories() {
    // Note presence of `static` keyword: this indicates that getStories is
    //  **not** an instance method. Rather, it is a method that is called on the
    //  class directly. Why doesn't it make sense for getStories to be an
    //  instance method?
    // Because once you've called it, it's no longer useful to store with individual story instances

    // query the /stories endpoint (no auth required)
    const response = await axios({
      url: `${BASE_URL}/stories`,
      method: "GET",
    });

    // turn plain old story objects from API into instances of Story class
    const stories = response.data.stories.map(story => new Story(story));

    // build an instance of our own class using the new array of stories
    return new StoryList(stories);
  }

  /** Adds story data to API, makes a Story instance, adds it to story list.
   * - user - the current instance of User who will post the story
   * - obj of {title, author, url}
   *
   * Returns the new Story instance
   */

  async addStory(currentUser, storyData) {
    // UNIMPLEMENTED: complete this function!
    // to make post use axios.post(url, [data,])

    const token = currentUser.loginToken;
    const dataFormat = {"token": `${token}`, 
      "story": storyData
    }

      const response = await axios({
        method: "POST",
        url: `${BASE_URL}/stories`,
        data: dataFormat
      });

    const storyInst = new Story(response.data.story);
    
    this.stories.unshift(storyInst);
    currentUser.ownStories.unshift(storyInst);
            
    return storyInst;
  }

  // async deleteStory(){
  //   //delete story from user stories and favorites

  // }

  async deleteStoryFromAPI(user,storyId){
    console.log('deleteStoryFromAPI');

    const token = {"token": `${user.loginToken}`}

    const res = await axios({
      method: "DELETE",
      url: `${BASE_URL}/stories/${storyId}`,
      data: token
    })

    //remove from storylist
    this.stories = this.stories.filter(s => s.storyId !== storyId);

    user.favorites = user.favorites.filter(s => s.storyId !== storyId);

    user.ownStories = user.ownStories.filter(s => s.storyId !== storyId);

    return res;
  }
}

// https://hack-or-snooze-v3.herokuapp.com/stories

// test case:
// let newStory = await StoryList.addStory(currentUser, {title: "happy", author: "Me", url: "http://meow.com"})
// newStory instance of Story;

/******************************************************************************
 * User: a user in the system (only used to represent the current user)
 */

class User {
  /** Make user instance from obj of user data and a token:
   *   - {username, name, createdAt, favorites[], ownStories[]}
   *   - token
   */

  constructor({
                username,
                name,
                createdAt,
                favorites = [],
                ownStories = []
              },
              token) {
    this.username = username;
    this.name = name;
    this.createdAt = createdAt;

    // instantiate Story instances for the user's favorites and ownStories
    this.favorites = favorites.map(s => new Story(s));
    this.ownStories = ownStories.map(s => new Story(s));

    // store the login token on the user so it's easy to find for API calls.
    this.loginToken = token;
  }

  /** Register new user in API, make User instance & return it.
   *
   * - username: a new username
   * - password: a new password
   * - name: the user's full name
   */

  static async signup(username, password, name) {
    const response = await axios({
      url: `${BASE_URL}/signup`,
      method: "POST",
      data: { user: { username, password, name } },
    });

    let { user } = response.data

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** Login in user with API, make User instance & return it.

   * - username: an existing user's username
   * - password: an existing user's password
   */

  static async login(username, password) {
    const response = await axios({
      url: `${BASE_URL}/login`,
      method: "POST",
      data: { user: { username, password } },
    });

    let { user } = response.data;

    return new User(
      {
        username: user.username,
        name: user.name,
        createdAt: user.createdAt,
        favorites: user.favorites,
        ownStories: user.stories
      },
      response.data.token
    );
  }

  /** When we already have credentials (token & username) for a user,
   *   we can log them in automatically. This function does that.
   */

  static async loginViaStoredCredentials(token, username) {
    try {
      const response = await axios({
        url: `${BASE_URL}/users/${username}`,
        method: "GET",
        params: { token },
      });

      let { user } = response.data;

      return new User(
        {
          username: user.username,
          name: user.name,
          createdAt: user.createdAt,
          favorites: user.favorites,
          ownStories: user.stories
        },
        token
      );
    } catch (err) {
      console.error("loginViaStoredCredentials failed", err);
      return null;
    }
  }

  async addFavoriteStory(storyId){
    // Call API
    // Return new favorite
    // Add new story to the DOM

    // https://private-anon-764bc013eb-hackorsnoozev3.apiary-mock.com/users/hueter/favorites/32d336da-98cd-4010-bb39-1d789b9bef50

    // `/users/${username}/favorites/${storyId}`
    const username = this.username;
    const token = this.loginToken;
    // const storyId = currentUser
    // most key data available via 'this'

    const res = await axios({
      method: "POST",
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      data: {token},
    });

    const story = await axios({
      method: "GET",
      url: `${BASE_URL}/stories/${storyId}`,
      params: {token},
    });

    const storyInst = new Story(story.data.story)
    // story isn't in a Story format
    this.favorites.push(storyInst);
    // push to favorites array
    // Or append to the DOM (UI) 
    // else it won't be added until page load

  
    return res;
  }

  async removeFavoriteStory(storyId){
    console.log('enetered removeFavStory');

    const username = this.username;
    const token = this.loginToken;

    const favorites = this.favorites;

    const res = await axios({
      method: "DELETE",
      url: `${BASE_URL}/users/${username}/favorites/${storyId}`,
      data: {token},
    });

    const story = await axios({
      method: "GET",
      url: `${BASE_URL}/stories/${storyId}`,
      params: {token},
    });

    this.favorites = this.favorites.filter(f => f.storyId !== storyId);

    loadFavorites();

    //populate DOM


    // currentUser.favorites[0].storyId

    console.log(favorites)

    return res;
  }

  async _addOrRemoveStory(storyId){
    //assign click listener to star object
    //check for storyId in user favorites
    const favorites = this.favorites;

    // use array method that returns T/F

    const isFav = favorites.some(s => s.storyId === storyId);

    if(isFav){
      await this.removeFavoriteStory(storyId);
    }else{
      await this.addFavoriteStory(storyId);
    }


    //if present, call remove story
    //else call add story
    //check if story is already 


  }



}

// const newFav = await currentUser.addFavoriteStory(currentUser,'e6493a14-4518-4f93-9950-50acf354758a')
// const removedFav = await currentUser.removeFavoriteStory(currentUser,'e6493a14-4518-4f93-9950-50acf354758a')
// const addedOrRemovedFav = await currentUser._addOrRemoveStory('e6493a14-4518-4f93-9950-50acf354758a')