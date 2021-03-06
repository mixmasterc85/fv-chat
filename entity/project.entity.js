const axios = require("axios");
// const Crypto = require("cryptojs").Crypto;
const Crypto = require("cryptojs").Crypto;
const config = require("../config/config.json");
const Joi = require("@hapi/joi");

module.exports.getProjects = async (data) => {
  try {
    const tokenData = await this.getToken();
    const projectsearchterm = data.sessionInfo.parameters.projectsearchterm;
    const projectsearctermNew = projectsearchterm.replace('.','');

    if (tokenData.data.accessToken) {
      let newUrl = `${config.BASE_URL}/core/projects`;
      newUrl += data.number ? `?number=${data.number}` : "";
      newUrl += data.limit ? `?limit=1` : "";
      newUrl += data.offset ? `?offset=${data.offset}` : "";
      newUrl += projectsearchtermNew ? `?name=${projectsearchtermNew}` : "";

      const tag = data.fulfillmentInfo.tag;

      const options = {
        method: "GET",
        url: newUrl,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.data.accessToken}`,
          "x-fv-sessionid": tokenData.data.refreshToken,
          "x-fv-userid": tokenData.data.userId,
          "x-fv-orgid": tokenData.data.orgId,
        },
      };
      if (tag === "Search Term") {
        var message =
          "I have located the project" +
          data.sessionInfo.parameters.projectsearchterm;
      } else {
        let term = "Tag not found";
        return this.errorjsonresponse(term);
      }

      const resp = await axios.request(options);

      if (resp.data && resp.data.items.length > 1) {
        let projectresponse = resp.data.items[0];

        const jsonresponse = this.jsonresponse(
          message,
          projectresponse.projectId.native,
          projectresponse.projectName
        );
        return jsonresponse;
      } else {
        let errormessage = "Project not found";
        return this.errorjsonresponse(errormessage);
      }
    }
  } catch (err) {
    return this.errorjsonresponse(err);
  }
};

module.exports.addNotes = async (data) => {
  try {
    const tokenData = await this.getToken();

    const tag = data.fulfillmentInfo.tag;
    let errormessage = "Note is not created";
    if (tag === "Filevine Note") {
      const options = {
        method: "POST",
        url: `${config.BASE_URL}/core/notes`,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${tokenData.data.accessToken}`,
          "x-fv-sessionid": tokenData.data.refreshToken,
          "x-fv-userid": tokenData.data.userId,
          "x-fv-orgid": tokenData.data.orgId,
        },
        data: {
          body: data.sessionInfo.parameters.filevinenote,
          projectId: {
            native: data.sessionInfo.parameters.projectNumber,
            partner: "",
          },
        },
      };

      const response = await axios.request(options);
      if (response.data) {
        return response.data;
      } else {
        return this.errorjsonresponse(errormessage);
      }
    } else {
      return this.errorjsonresponse(errormessage);
    }
  } catch (err) {
    return this.errorjsonresponse(err);
  }
};

module.exports.getToken = async () => {
  const timestamp = new Date().toISOString();
  const apiKey = config.API_KEY;
  const apiSecret = config.secret_key;
  const payload = [apiKey, timestamp, apiSecret].join("/");
  const hash = Crypto.MD5(payload).toString();
  const options = {
    method: "POST",
    url: `${config.BASE_URL}/session`,
    headers: { "Content-Type": "application/json" },
    data: {
      mode: "key",
      apiKey: config.API_KEY,
      apiHash: hash,
      apiTimestamp: timestamp,
    },
  };

  return await axios.request(options);
};
module.exports.jsonresponse = (message, projectid, projectname) => {
  const jsonResponse = {
    fulfillment_response: {
      messages: [
        {
          text: {
            //fulfillment text response
            text: [message],
          },
        },
      ],
    },
    targetPage:
      "projects/steady-observer-143220/locations/us-west1/agents/4627e951-d0af-4853-9f13-45a01a63f2ba/flows/00000000-0000-0000-0000-000000000000/pages/7ec52ffb-8251-4501-b76d-1dfdd135bece",
    sessionInfo: {
      parameters: {
        projectNumber: projectid,
        projectName: projectname,
      },
    },
  };
  return jsonResponse;
};

module.exports.errorjsonresponse = (msg) => {
  const errorjsonResponse = {
    fulfillment_response: {
      messages: [
        {
          text: {
            //fulfillment text response
            text: [msg],
          },
        },
      ],
    },
  };
  return errorjsonResponse;
};
