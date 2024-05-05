import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, Text, View, Image, FlatList, TouchableOpacity, TextInput} from 'react-native';
import axios from 'axios';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7', 
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 50, 
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
    padding: 10,
    backgroundColor: '#FFFFFF', 
    borderRadius: 10, 
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  image: {
    width: 50,
    height: 50,
    marginRight: 20, 
  },
  typeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    padding: 10, 
  },
  typeButton: {
    padding: 5, 
    margin: 3, 
    borderRadius: 15,
    backgroundColor: '#78C850', 
  },
  typeButtonSelected: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  searchInput: {
    height: 40,
    margin: 12,
    borderWidth: 1,
    borderColor: '#D3D3D3', 
    padding: 10,
    borderRadius: 20,
    width: '90%',
    backgroundColor: '#FFFFFF', 
  },
  buttonText: {
    fontSize: 12,
    color: '#FFFFFF', 
    fontWeight: 'bold', 
  },
});

const getTypeColor = (typeName) => {
  const typeColors = {
    normal: '#A8A77A',
    fire: '#EE8130',
    water: '#6390F0',
    electric: '#F7D02C',
    grass: '#7AC74C',
    ice: '#96D9D6',
    fighting: '#C22E28',
    poison: '#A33EA1',
    ground: '#E2BF65',
    flying: '#A98FF3',
    psychic: '#F95587',
    bug: '#A6B91A',
    rock: '#B6A136',
    ghost: '#735797',
    dragon: '#6F35FC',
    dark: '#705746',
    steel: '#B7B7CE',
    fairy: '#D685AD',
  };
  return typeColors[typeName] || '#78C850';
};

export default function App() {
  const [pokemons, setPokemons] = useState([]);
  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [selectedPokemonDetails, setSelectedPokemonDetails] = useState(null);
  const [allPokemons, setAllPokemons] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  

  useEffect(() => {
    const fetchPokemons = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=1000');
        const pokemonList = response.data.results.map(pokemon => ({
          ...pokemon,
          id: pokemon.url.split('/').filter(Boolean).pop() 
        }));
        setPokemons(pokemonList);
        setAllPokemons(pokemonList); 
      } catch (error) {
        console.error("Error fetching data: ", error);
      }
    };
    fetchPokemons();
  }, []);

  useEffect(() => {
    const fetchTypes = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/type');
        setTypes(response.data.results.map((type) => type.name));
      } catch (error) {
        console.error("Error fetching types: ", error);
      }
    };
  
    fetchTypes();
  }, []);

  const showAllPokemons = () => {
    setPokemons(allPokemons);
    setSelectedType(null); 
  };

  const filterPokemonsByType = async (typeName) => {
    setSelectedType(typeName);
    try {
      const response = await axios.get(`https://pokeapi.co/api/v2/type/${typeName}`);
      const filteredPokemons = response.data.pokemon.map(p => {
        const id = p.pokemon.url.split('/').filter(Boolean).pop();
        return {
          name: p.pokemon.name,
          url: p.pokemon.url,
          id: id, 
        };
      });
      setPokemons(filteredPokemons);
    } catch (error) {
      console.error("Error fetching Pokémon by type: ", error);
    }
  };

  const TypeButton = ({ typeName, onPress, selected }) => (
    <TouchableOpacity
      style={[
        styles.typeButton,
        { backgroundColor: getTypeColor(typeName) },
        selected && styles.typeButtonSelected, 
      ]}
      onPress={onPress}
    >
      <Text style={styles.buttonText}>{typeName.charAt(0).toUpperCase() + typeName.slice(1)}</Text>
    </TouchableOpacity>
  );

  const handleSearch = (text) => {
    setSearchQuery(text);
  
    if (!text.trim()) {
      setPokemons(allPokemons);
    } else {
      const filteredPokemons = allPokemons.filter(pokemon => {
        return pokemon.name.toLowerCase().includes(text.toLowerCase());
      });
      setPokemons(filteredPokemons);
    }
  };

  const fetchAndShowDetails = async (pokemon) => {
    try {
      const response = await axios.get(pokemon.url);
      setSelectedPokemonDetails(response.data);
    } catch (error) {
      console.error("Error fetching Pokémon details: ", error);
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      onPress={() => fetchAndShowDetails(item)}
      style={styles.listItem}
    >
    <Text>{item.name}</Text>
    <Image
      source={{ uri: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png` }}
      style={styles.image}
    />
      {selectedPokemonDetails && selectedPokemonDetails.name === item.name && (
        <View style={styles.detailView}>
          <Text>Height: {selectedPokemonDetails.height}</Text>
          <Text>Weight: {selectedPokemonDetails.weight}</Text>
          <Text>Type: {selectedPokemonDetails.types.map((typeInfo) => typeInfo.type.name).join(', ')}</Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
        <TextInput
        style={styles.searchInput}
        placeholder="Search Pokémon"
        value={searchQuery}
        onChangeText={handleSearch}
      />
    <View style={styles.typeContainer}>
    <TypeButton key="all" typeName="All" onPress={showAllPokemons} />
      {types.map((typeName) => (
        <TypeButton key={typeName} typeName={typeName} onPress={() => filterPokemonsByType(typeName)} />
      ))}
    </View>
    <FlatList
        data={pokemons}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
    />
    <StatusBar style="auto" />
  </View>
  );
}

