/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect } from "react";
import axios from "axios";
import jwt_decode from "jwt-decode";
import { useNavigate } from "react-router-dom";

import "./dashboard.css";

const Dashboard = () => {
  const [name, setName] = useState("");
  const [token, setToken] = useState("");
  const [expire, setExpire] = useState("");
  const [users, setUsers] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const [filteredResults, setFilteredResults] = useState([]);
  const [updateName, setUpdateName] = useState();
  const [updateEmail, setUpdateEmail] = useState();
  const [msg, setMsg] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    refreshToken();
    getUsers();
  }, [msg]);

  const searchItems = (searchValue) => {
    setSearchInput(searchValue);
    console.log(users);
    if (searchValue !== "") {
      console.log(searchValue);
      const filteredData = users.filter((item) => {
        return (
          Object.values(item)
            // .join("")
            .toString()
            .replaceAll(",", "")
            .toLowerCase()
            .includes(searchValue.toLowerCase())
        );
      });
      console.log("===============", searchValue);
      setFilteredResults(filteredData);
    } else {
      setFilteredResults(users);
    }
  };

  const refreshToken = async () => {
    try {
      const response = await axios.get("http://localhost:5000/token");
      setToken(response.data.accessToken);
      const decoded = jwt_decode(response.data.accessToken);
      setName(decoded.name);
      setExpire(decoded.exp);
    } catch (error) {
      if (error.response) {
        navigate("/");
      }
    }
  };

  const axiosJWT = axios.create();

  axiosJWT.interceptors.request.use(
    async (config) => {
      const currentDate = new Date();
      if (expire * 1000 < currentDate.getTime()) {
        const response = await axios.get("http://localhost:5000/token");
        config.headers.Authorization = `Bearer ${response.data.accessToken}`;
        setToken(response.data.accessToken);
        const decoded = jwt_decode(response.data.accessToken);
        setName(decoded.name);
        setExpire(decoded.exp);
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  const getUsers = async () => {
    const response = await axiosJWT.get("http://localhost:5000/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    setUsers(response.data);
  };

  // console.log("success-------", updateName, updateEmail);
  const update = async (id) => {
    // e.preventDefault();
    try {
      const res = await axios.put("http://localhost:5000/update", {
        id: id,
        name: updateName,
        email: updateEmail,
      });
      // navigate("/dashboard");
      alert(res.data.msg);
    } catch (error) {
      if (error.response) {
        // setMsg(error.response.data.msg);
        alert(error.response.data.msg);
      }
    }
  };

  const Delete = async (name) => {
    try {
      const res = await axios.delete("http://localhost:5000/delete", {
        data: { name },
      });
      setMsg(res.data.msg);
    } catch (error) {}
  };

  return (
    <div className="container mt-5">
      <h1>Welcome Back: {name}</h1>
      <h2>{msg}</h2>
      <input
        className="input is-rounded"
        type="text"
        onChange={(e) => searchItems(e.target.value)}
        placeholder="Search..."
      ></input>
      <table className="table is-striped is-fullwidth">
        <thead>
          <tr>
            <th>No</th>
            <th>Name</th>
            <th>Email</th>
            <th>More</th>
          </tr>
        </thead>
        <tbody>
          {console.log("Lee---------", filteredResults, searchInput)}
          {searchInput.length > 0
            ? filteredResults.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      className="upInput"
                      type="text"
                      defaultValue={user.name}
                      onChange={(e) => setUpdateName(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="upInput"
                      type="text"
                      defaultValue={user.email}
                      onChange={(e) => setUpdateEmail(e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="buttons">
                      <button
                        className="button is-info"
                        onClick={() => update(user.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="button is-danger"
                        onClick={() => Delete(user.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            : users.map((user, index) => (
                <tr key={user.id}>
                  <td>{index + 1}</td>
                  <td>
                    <input
                      className="upInput"
                      type="text"
                      defaultValue={user.name}
                      onChange={(e) => setUpdateName(e.target.value)}
                    />
                  </td>
                  <td>
                    <input
                      className="upInput"
                      type="text"
                      defaultValue={user.email}
                      onChange={(e) => setUpdateEmail(e.target.value)}
                    />
                  </td>
                  <td>
                    <div className="buttons">
                      <button
                        className="button is-info"
                        onClick={() => update(user.id)}
                      >
                        Edit
                      </button>
                      <button
                        className="button is-danger"
                        onClick={() => Delete(user.name)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
};

export default Dashboard;
