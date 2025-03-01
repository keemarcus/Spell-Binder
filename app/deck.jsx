import { useLocalSearchParams } from "expo-router";
import { View, ScrollView, Text, StyleSheet, Pressable, TextInput, Image } from 'react-native'

import { useState, useEffect, useContext } from 'react'
import { SafeAreaView } from "react-native-safe-area-context";
import { ThemeContext } from "@/context/ThemeContext";
import { StatusBar } from "expo-status-bar";
import { Inter_500Medium, useFonts } from "@expo-google-fonts/inter";
import Octicons from "@expo/vector-icons/Octicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";


export default function EditScreen() {
    const { id } = useLocalSearchParams()
    const [todo, setTodo] = useState({})
    const { colorScheme, setColorScheme, theme } = useContext(ThemeContext)
    const router = useRouter()

    var [searchCard, setSearchCard] = useState("black lotus");
    var [cardName, setCardName] = useState("");
    var [cardText, setCardText] = useState("");
    var [cardImage, setCardImage] = useState("");
    var [cards, setCards] = useState([]);

    const [loaded, error] = useFonts({
        Inter_500Medium,
    })


    if (!loaded && !error) {
        return null
    }

    const styles = createStyles(theme, colorScheme)

    const handleSave = async () => {
        try {
            const savedTodo = { ...todo, title: todo.title }

            const jsonValue = await AsyncStorage.getItem('TodoApp')
            const storageTodos = jsonValue != null ? JSON.parse(jsonValue) : null

            if (storageTodos && storageTodos.length) {
                const otherTodos = storageTodos.filter(todo => todo.id !== savedTodo.id)
                const allTodos = [...otherTodos, savedTodo]
                await AsyncStorage.setItem('TodoApp', JSON.stringify(allTodos))
            } else {
                await AsyncStorage.setItem('TodoApp', JSON.stringify([savedTodo]))
            }

            router.push('/')
        } catch (e) {
            console.error(e)
        }
    }

    const findDeck = async () => {
        // clear out any existing deck info first
        setCards([]);

        var url = "http://127.0.0.1:5000/user/1/deck/test"
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }

            const deck = await response.json();
            //console.log(deck);

            for (var card of deck['deck_json']) {
                const cardDetails = await findCard(card['card_name'])
                if(cardDetails['power']){
                    setCards(cards => [...cards,
                        <Text style={styles.cardHeader} key={cards.length + "-name"}>{card['quantity'] + "x " + cardDetails['name']}</Text>,
                        <View style={{ flexDirection: "row", width: '95%', alignSelf: 'center' }} key={cards.length + "-wrapper"}>
                            <Image
                                key={cards.length + "-image"}
                                style={styles.cardImage}
                                source={{ uri: cardDetails['image_uris']['art_crop'] }}
                                resizeMode={"stretch"}
                            />
                            <View style={{ flexDirection: "column", width: '95%', alignSelf: 'top' }} key={cards.length + "-info-wrapper"}>
                                <Text style={styles.cardInfoText} key={cards.length + "-mana"}>{cardDetails['mana_cost']}</Text>
                                <Text style={styles.cardInfoText} key={cards.length + "-type"}>{cardDetails['type_line']}</Text>
                                <Text style={styles.cardInfoText} key={cards.length + "-power"}>{cardDetails['power'] + "/" + cardDetails['toughness']}</Text>
                            </View>
                        </View>,
                        <Text style={styles.cardText} key={cards.length + "-text"}>{cardDetails['oracle_text']}</Text>,
                        <Text key={cards.length + "-blank"}>{"\n"}</Text>
                        ]);
                }else{
                    setCards(cards => [...cards,
                        <Text style={styles.cardHeader} key={cards.length + "-name"}>{card['quantity'] + "x " + card['card_name']}</Text>,
                        <View style={{ flexDirection: "row", width: '95%', alignSelf: 'center' }} key={cards.length + "-wrapper"}>
                            <Image
                                key={cards.length + "-image"}
                                style={styles.cardImage}
                                source={{ uri: cardDetails['image_uris']['art_crop'] }}
                                resizeMode={"stretch"}
                            />
                            <View style={{ flexDirection: "column", width: '95%', alignSelf: 'top' }} key={cards.length + "-info-wrapper"}>
                                <Text style={styles.cardInfoText} key={cards.length + "-mana"}>{cardDetails['mana_cost']}</Text>
                                <Text style={styles.cardInfoText} key={cards.length + "-type"}>{cardDetails['type_line']}</Text>
                            </View>
                        </View>,
                        <Text style={styles.cardText} key={cards.length + "-text"}>{cardDetails['oracle_text']}</Text>,
                        <Text key={cards.length + "-blank"}>{"\n"}</Text>
                        ]);
                }
            }
        } catch (e) {
            console.error(e)
        }
    }

    const findCard = async (cardName) => {
        var url = "https://api.scryfall.com/cards/named?fuzzy=" + cardName
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`Response status: ${response.status}`);
            }
            return await response.json();
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.inputContainer}>
                <TextInput
                    style={styles.input}
                    maxLength={30}
                    placeholder="Edit todo"
                    placeholderTextColor="gray"
                    onChangeText={setSearchCard}
                    value={searchCard || ''}
                //onChangeText={(text) => setTodo(prev => ({ ...prev, title: text }))}
                />
                <Pressable
                    onPress={() => setColorScheme(colorScheme === 'light' ? 'dark' : 'light')} style={{ marginLeft: 10 }}>

                    <Octicons name={colorScheme === 'dark' ? "moon" : "sun"} size={36} color={theme.text} selectable={undefined} style={{ width: 36 }} />

                </Pressable>
            </View>
            <View style={styles.inputContainer}>
                <Pressable
                    //onPress={handleSave}
                    onPress={findDeck}
                    style={styles.saveButton}
                >
                    <Text style={styles.saveButtonText}>Search</Text>
                </Pressable>
                <Pressable
                    onPress={() => router.push('/')}
                    style={[styles.saveButton, { backgroundColor: 'red' }]}
                >
                    <Text style={[styles.saveButtonText, { color: 'white' }]}>Cancel</Text>
                </Pressable>
            </View>
            <ScrollView style={{ width: '100%' }}>
                {cards}
            </ScrollView>
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        </SafeAreaView>
    )
}

function createStyles(theme, colorScheme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            width: '100%',
            backgroundColor: theme.background,
        },
        inputContainer: {
            flexDirection: 'row',
            alignItems: 'center',
            padding: 10,
            gap: 6,
            width: '100%',
            maxWidth: 1024,
            marginHorizontal: 'auto',
            pointerEvents: 'auto',
        },
        input: {
            flex: 1,
            borderColor: 'gray',
            borderWidth: 1,
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
            fontSize: 18,
            fontFamily: 'Inter_500Medium',
            minWidth: 0,
            color: theme.text,
        },
        saveButton: {
            backgroundColor: theme.button,
            borderRadius: 5,
            padding: 10,
        },
        saveButtonText: {
            fontSize: 18,
            color: colorScheme === 'dark' ? 'black' : 'white',
        },
        cardImage: {
            width: 626 / 4,
            height: 457 / 4,
            alignSelf: 'left',
            borderWidth: 2,
            borderRadius: 5,
        },
        text: {
            width: '80%',
        },
        cardHeader: {
            paddingLeft: '3%',
            textAlign: 'left',
            fontSize: 20,
        },
        cardText: {
            paddingLeft: '3%'
        },
        cardInfoText: {
            paddingLeft: '1%',
            paddingRight: '5%',
            //flexWrap: 'wrap',
            fontSize: 20,
        }
    })
}