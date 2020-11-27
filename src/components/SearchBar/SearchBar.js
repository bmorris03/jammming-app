import React from 'react';
import './SearchBar.css';

class SearchBar extends React.Component {
	constructor(props) {
		super(props);

		//set initial state to avoid loop
		this.state = { term: '' };

		this.search = this.search.bind(this);
		this.handleTermChange = this.handleTermChange.bind(this);
		this.handleKeyPress = this.handleKeyPress.bind(this);
	}

	search() {
		this.props.onSearch(this.state.term);
		//store search term locally
		window.localStorage.setItem('searchText', this.state.term);
	}

	handleTermChange(event) {
		this.setState({
			term: event.target.value
		});
	}

	handleKeyPress(event) {
		//trigger search on 'enter' key press
		if (event.keyCode === 13) {
			document.getElementById('search').click();
		}
	}

	render() {
		return (
			<div className="SearchBar">
				<input id="search-input" placeholder="Enter A Song, Album, or Artist" onChange={this.handleTermChange} onKeyDown={this.handleKeyPress} autoFocus />
				<button id="search" className="SearchButton" onClick={this.search}>SEARCH</button>
			</div>
		);
	}
}

export default SearchBar;