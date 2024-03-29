import React, { useState, useEffect, useRef } from "react";
import useInput from "../hooks/useInput";
import SearchList from "./SearchList";
import useToggler from "../hooks/useToggler";
import Loader from "./Loader";
import { Button, TextField, Dialog } from "@material-ui/core";
import SearchIcon from "@material-ui/icons/Search";
import Spinner from "./Spinner";
import useStyles from "../../style/theme";
const axios = require("axios");

const Search = ({ userId, addProduct, startSpinner, getAllProducts }) => {
  const firstRender = useRef(true);
  const [searchVal, handleSearchVal, resetSearch] = useInput("");
  const [urlInput, setUrl, resetUrl] = useInput("");
  const [results, setResults] = useState([]);
  const [isFetching, toggler] = useToggler(false);
  const [open, setOpen] = useState(false);
  const [spinner, setSpinner] = useState(false);
  const classes = useStyles();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!searchVal) return alert("Please fill in the search bar input!");

    toggler();
    const params = {
      api_key: "F11338D85B5B485CBDE4F31BF782B232",
      search_type: "shopping",
      sort_by: "price_low_to_high",
      gl: "us",
      hl: "en",
      google_domain: "google.com",
      q: `${searchVal}`, //,merchagg:g8277688%7Cg829768`,
      shopping_condition: "new",
      shopping_merchants: "g8277688,g8299768,g7187155",
    };
    axios
      .get("https://api.scaleserp.com/search", { params })
      // .then((response) => response.json())
      .then((response) => {
        const goodUrl = "google.com/shopping/product/";
        console.log(response.data);
        const items = response.data.shopping_results;
        //   .filter((item) => {
        //     return item.link.includes(goodUrl);
        //   })
        //   .slice(0, 20);

        console.log("items: ", items);
        setOpen(true);
        setResults(items);
        console.log("open: ", open);
        firstRender.current = false;
      })
      .catch((err) => console.log(err));

    resetSearch();
  };

  const clearResults = () => {
    setOpen(false);
    setResults([]);
  };

  const handleUrl = (e) => {
    e.preventDefault();

    const goodUrl = "google.com/shopping/product/";

    if (!urlInput.includes(goodUrl)) {
      resetUrl();
      return alert("Invalid product url. Please try again");
    }

    setSpinner(true);
  };

  useEffect(() => {
    if (firstRender.current) return;
    if (results.length < 1) return; // maybe render a component for no products
    toggler();
  }, [results]);

  useEffect(() => {
    if (!spinner) return;

    const google_url = urlInput;

    fetch(`/api/products/${userId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        google_url,
        userId,
      }),
    })
      .then((res) => res.json())
      .then((res) => {
        getAllProducts();
        setSpinner(false);
        resetUrl();
      })
      .catch((err) => {
        console.log("main ue addProduct", err);
        setSpinner(false);
        alert("Uh oh! Seems like the link is broken. Please try again.");
        resetUrl();
      });
  }, [spinner]);

  if (isFetching) return <Loader />;
  if (spinner) return <Spinner />;

  return results.length > 0 ? (
    <Dialog open={open} onClose={clearResults}>
      <SearchList
        startSpinner={startSpinner}
        results={results}
        clearResults={clearResults}
        addProduct={addProduct}
        setOpen={setOpen}
      />
    </Dialog>
  ) : (
    <>
      <form onSubmit={handleSubmit}>
        <TextField
          className={classes.searchBar}
          variant="outlined"
          label="Search for a product"
          value={searchVal}
          onChange={handleSearchVal}
          inputProps={{ className: classes.searchBar }}
        />
      </form>
      <Button
        className={classes.searchBtn}
        variant="contained"
        color="primary"
        onClick={handleSubmit}
        endIcon={<SearchIcon />}
      >
        Search
      </Button>
      {/* <TextField
					className={classes.searchBar}
					variant="outlined"
					label="Enter Product URL"
					value={urlInput}
					onChange={setUrl}
					inputProps={{ className: classes.searchBar }}
				/> */}
      {/* <Button
					className={classes.searchBtn}
					variant="contained"
					color="primary"
					onClick={handleUrl}
					endIcon={<SearchIcon />}
				>
					Enter Url
				</Button> */}
    </>
  );
};

export default Search;

// https://www.google.com/search?q=headphones&gl=us&hl=en&tbm=shop&tbs=vw:l,new:1,merchagg:g8277688%7Cg829976,p_ord:p,
// https://www.google.com/search?gl=us&hl=en&tbm=shop&q=headphones&tbs=vw:l,mr:1,p_ord:p,new:1,cat:505771,merchagg:g8277688%7Cg829976%7Cg8299768&sa=X&ved=0ahUKEwiM3dzlvYvuAhVGcq0KHcZFArYQsysIvgUoBQ&biw=1860&bih=1257
