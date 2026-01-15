// Server API makes it possible to hook into various parts of Gridsome
// on server-side and add custom data to the GraphQL data layer.
// Learn more: https://gridsome.org/docs/server-api

// Changes here require a server restart.
// To restart press CTRL + C in terminal and run `gridsome develop`

const axios = require("axios");
const oauth = require("axios-oauth-client");
const slugify = require("slugify");

module.exports = function(api) {
  api.loadSource(async store => {
    // Get OAuth 2 token
    const getClientCredentials = await oauth.client(axios.create(), {
      url: process.env.API_TOKEN_URL,
      grant_type: "client_credentials",
      client_id: process.env.CLIENT_ID,
      client_secret: process.env.CLIENT_SECRET,
      scope: "officernd.api.read"
    });

    const auth = await getClientCredentials();

    // Create API token
    const headerAuth = `Bearer ${auth.access_token}`;

    // Get member data
    const { data: member } = await axios.get(process.env.API_MEMBERS_URL, {
      headers: {
        Authorization: headerAuth
      }
    });

    // Get team data
    const { data: team } = await axios.get(process.env.API_TEAMS_URL, {
      headers: {
        Authorization: headerAuth
      }
    });

    // create members collection
    const members = store.addCollection("Member");

    // create teams collection
    const teams = store.addCollection("Team");

    // function to set priority so that profiles with images is shown before those without
    const setPriority = url => {
      let priority = 3;

      if (typeof url == "string") {
        priority = url.startsWith("//")
          ? 1
          : url.startsWith("http://pbs.twimg.com/")
          ? 1
          : 2;
      }
      return priority;
    };

    const isProfileHidden = item => {
      // checks if the object exist as it registers as undefined if the user hasn't logget into the portal
      if (typeof item === "undefined") {
        return false;
      } else {
        return (hide = item.hide ? true : false);
      }
      return false;
    };

    const getPrivacyOptions = item => {
      let obj = {};

      // checks if the object exist as it registers as undefined if the user hasn't logget into the portal
      if (typeof item === "undefined") {
        obj.hideContactDetails = false;
        obj.hidePublicProfiles = false;
        return obj;
      } else {
        obj.hideContactDetails = item.hideContactDetails ? true : false;
        obj.hidePublicProfiles = item.hidePublicProfiles ? true : false;
        return obj;
      }
    };

    const getSDGs = item => {
      let obj = [];

      // checks if the object exist as it registers as undefined if no custom properties has been set
      if (typeof item !== "undefined") {
        if (item.sdg && item.sdg.length > 0) obj = item.sdg;
      }
      return obj;
    };

    // function to fix urls without http(s)
    const fixUrl = item => {
      if (item) {
        return item.startsWith("http") ? item : "//" + item;
      } else return;
    };

    //function to create the correct image url
    const getCleanImage = item => {
      let cleanImageUrl =
        "https://cdn.prod.website-files.com/633d71ff5625100570e7e68c/68f8d711d95a532bded7c6c3_default.png";
      if (item != null) {
        cleanImageUrl =
          "https://ik.imagekit.io/socentral/" +
          item.replace(/^.*cloudfront\.net\//, "") +
          "?tr=h-640";
      }
      return cleanImageUrl;
    };

    // store data in members collection by iterating member data
    for (const item of member) {
      // skip member if privacy is set to hidden
      if (isProfileHidden(item.portalPrivacy)) {
        continue;
      }
      // gets the url of the image
      const memberImage = getCleanImage(item.image);

      // gets the privacy options
      const privacyOptions = getPrivacyOptions(item.portalPrivacy);

      // gets view order priorities
      let memberPriority = setPriority(item.image);

      // gets the topic tags
      // let topicTags = getTopics(item.properties);
      let sdg = getSDGs(item.properties);

      // slugify the member name to use as route
      let slug = slugify(item.name, {
        lower: true,
        remove: /[*+~.()/'"?!:@]/g
      });
      let teamSlug = slugify(item.team.name, {
        lower: true,
        remove: /[*+~.()/'"?!:@]/g
      });

      // add values to the members collection
      members.addNode({
        slug: slug,
        name: item.name,
        email: item.email,
        phone: item.phone,
        image: memberImage,
        priority: memberPriority,
        tags: item.tags,
        created: item.createdAt,
        bio: item.description,
        sdgs: sdg,
        twitter: item.twitterHandle,
        linkedin: item.linkedin,
        privacy: privacyOptions,
        teamName: item.team.name,
        teamSlug: teamSlug
      });
    }

    // store data in teams collection by iterating team data
    for (const item of team) {
      // skip team if privacy is set to hidden
      if (isProfileHidden(item.portalPrivacy)) {
        continue;
      }

      // gets the url of the image
      const teamImage = getCleanImage(item.image);

      // gets the privacy options
      const privacyOptions = getPrivacyOptions(item.portalPrivacy);

      // gets view order priorities
      let teamPriority = setPriority(item.image);

      // slugify the team name to use as route
      let slug = slugify(item.name, {
        lower: true,
        remove: /[*+~.()/'"?!:@]/g
      });

      // gets the topic tags
      // let topicTags = getTopics(item.properties);
      let sdg = getSDGs(item.properties);

      // fix urls withour http(s)://
      let fixedUrl = fixUrl(item.url);

      // find team members and relevent values
      const memberProps = {};
      memberProps.members = [];
      for (const mItem of member) {
        // console.log(mItem.team._id);
        // skip the iteration if the member privacy is set to hidden
        if (isProfileHidden(mItem.portalPrivacy)) {
          continue;
        }

        if (mItem.team._id === item._id) {
          let memberSlug = slugify(mItem.name, {
            lower: true,
            remove: /[*+~.()/'"?!:@]/g
          });

          memberProps.members.push({
            name: mItem.name,
            slug: memberSlug
          });
        }
      }

      teams.addNode({
        slug: slug,
        name: item.name,
        created: item.startDate,
        bio: item.description,
        twitter: item.twitterHandle,
        url: fixedUrl,
        image: teamImage,
        sdgs: sdg,
        priority: teamPriority,
        privacy: privacyOptions,
        teamMembers: memberProps
      });
    }
  });
};
