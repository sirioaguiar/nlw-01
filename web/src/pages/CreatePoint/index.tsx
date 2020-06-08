import React, { useEffect, useState, ChangeEvent, FormEvent } from 'react';
import { Link,useHistory } from 'react-router-dom';
import { FiArrowLeft } from 'react-icons/fi';
import { Map, TileLayer, Marker} from 'react-leaflet';
import { LeafletMouseEvent } from 'leaflet';
import api from '../../services/api';
import axios from 'axios';

import './styles.css';
import logo from '../../assets/logo.svg';
import Dropzone from '../../components/Dropzone';


interface Item{
    id: number;
    title: string;
    image_url: string;
}

interface IBGEUFResponse{
    sigla:string;
}

interface IBGECityResponse{
    nome:string;
}


const CreatePoint = () => {
    const [items, setItems] = useState<Item[]>([]);
    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);
    const [formData, SetFormData] = useState({
        name: '',
        email: '',
        whatsapp: '',
        number: ''
    });

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedItems, setSelectedItems] = useState<number[]>([]);
    const [selectedPosition, setSelectedPosition] = useState<[number, number]>([0,0]);
    const [initialPosition, setInitialPosition] = useState<[number, number]>([0,0]);
    const [selectedFile, setSelectedFile] = useState<File> ();

    const history = useHistory();

//Localização do usuário no mapa
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(position => {
            const { latitude, longitude } = position.coords;

            setInitialPosition([latitude, longitude]) 
        });       
        
    },[]);
//items
    useEffect(() => {
        api.get('items').then(response =>
            setItems(response.data))
    },[]);
//UF
    useEffect(() => {
       axios.get<IBGEUFResponse[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
       .then(response => {
        const ufName = response.data.map(uf => uf.sigla);
        setUfs(ufName);
        });
    },[]);
//Cidades
    useEffect(() => {
        if(selectedUf === '0') {
            return;
        }
        axios.get<IBGECityResponse[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response => {
        const cityNames = response.data.map(city => city.nome);
        setCities(cityNames);
        });
    },[selectedUf]);
//Handle select UF
    function handleSelectUf(event: ChangeEvent<HTMLSelectElement>){
       const uf =  event.target.value;
       setSelectedUf(uf);
    }
//Handle select Cidade
   function handleSelectCity(event: ChangeEvent<HTMLSelectElement>){
       const city =  event.target.value;
       setSelectedCity(city);
    }
//handle map
    function handleMapClick(event: LeafletMouseEvent){
       setSelectedPosition([
           event.latlng.lat,
           event.latlng.lng
       ]
       )
    }
//handle inputs
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const { name, value } = event.target;
        SetFormData({...formData, [name]: value })
    }
//handle items selecionados
    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);
    
        if (alreadySelected >= 0  ) {
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
        } else {
            setSelectedItems([...selectedItems,id]);
        }
        
    }
//handle submit
    async function handleSubmit(event: FormEvent) {
        event.preventDefault();

        const { name, email, whatsapp, number } = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = new FormData();


            data.append('name', name);
            data.append('email', email);
            data.append('whatsapp', whatsapp);
            data.append('number', number);
            data.append('uf', uf);
            data.append('city', city);
            data.append('latitude', String(latitude));
            data.append('longitude', String(longitude));
            data.append('items', items.join(','));
            
            if (selectedFile){
            data.append('image', selectedFile);
            }
            
        await api.post('points', data);

        alert('Ponto de coleta criado!');

        history.push('/');
    }


    return (
        <div id="page-create-point">
            <header>
                <img src={logo} alt="Ecoleta" />
                <Link to ="/">
                    <FiArrowLeft />
                    Voltar para home
                </Link>
            </header>
            <form onSubmit={handleSubmit}>
                <h1>Cadastro do <br /> ponto de coleta</h1>

                <Dropzone
                    onFileUploaded={setSelectedFile}
                />
                

                

                <fieldset>
                    <legend>
                        <h2>Dados</h2>
                    </legend>
                    <div className="field">
                        <label htmlFor="name">Nome da entidade</label>
                        <input 
                            type="text"
                            name="name"
                            id="name"
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="email">E-mail</label>
                            <input 
                                type="email"
                                name="email"
                                id="email"
                                onChange={handleInputChange}
                            />
                        </div>
                            <div className="field">
                            <label htmlFor="name">Whatsapp</label>
                            <input 
                                type="text"
                                name="whatsapp"
                                id="whatsapp"
                                onChange={handleInputChange}
                            />
                        </div>                           
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Endereço</h2>
                        <span>Selecione o endereço no mapa</span>
                    </legend>
                        <Map 
                        center={initialPosition} 
                        zoom={15}
                        onClick={handleMapClick}
                        >
                            <TileLayer 
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributers'
                                url="https://{s}.tile.openStreetmap.org/{z}/{x}/{y}.png"
                                />
                            <Marker position={selectedPosition}
                            />

                        </Map>

                    <div className="field-group">
                        <div className="field">
                            <label htmlFor="uf">Estado</label>
                            <select 
                                name="uf" 
                                id="uf" 
                                value={selectedUf} 
                                onChange={handleSelectUf}
                                >
                                <option value="0">Selecione uma UF</option>
                                {ufs.map(uf => (
                                    <option key={uf} value={uf}>{uf}</option>
                                ))}
                            </select>
                        </div>
                            <div className="field">
                            <label htmlFor="city">Cidade</label>
                            <select 
                                name="city" 
                                id="city" 
                                value={selectedCity} 
                                onChange={handleSelectCity}
                                >
                                <option value="0">Selecione uma cidade</option>
                                {cities.map(city => (
                                    <option key={city} value={city}>{city}</option>
                                ))}
                            </select>                            
                        </div>
                        <div className="field">
                            <label htmlFor="number">Número</label>
                            <input 
                                type="number"
                                name="number"
                                id="number"
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </fieldset>

                <fieldset>
                    <legend>
                        <h2>Ítens de Coleta</h2>
                        <span>Selecione um ou mais itens abaixo</span>
                    </legend>
                    <ul className="items-grid">
                        {items.map(item => (
                            <li 
                            key = {item.id} 
                            onClick={() => handleSelectItem(item.id)}
                            className={selectedItems.includes(item.id) ? 'selected' : ''}
                            >
                            <img src={item.image_url} alt="Teste" />
                            <span>{item.title}</span>
                        </li>
                        ))}          
                    </ul>
                </fieldset>
                <button type="submit">Cadastrar</button>
            </form>
        </div>

    );
};

export default CreatePoint;