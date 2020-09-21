import React, { useState } from 'react';
import { Col, Row } from 'reactstrap';
import XLSX from 'xlsx';
import FormSelect from '../components/FormSelect';
import * as FileSaver from 'file-saver';

/* generate an array of column objects */

// const make_cols = (refstr) => {
// 	let arr = [],
// 		C = XLSX.utils.decode_range(refstr).e.c + 1;
// 	for (let i = 0; i < C; ++i)
//         arr[i] = { name: XLSX.utils.encode_col(i), key: i };
// 	return arr;
// };
const fileType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8';
const fileExtension = '.csv';

const convertStrToObj = (str) => {
	let obj = {};
	obj.value = str;
	obj.label = str;
	return obj;
};

const typeFile = [
    'xlsx','xlsb','xlsm','xls','xml','csv','txt','ods','fods','uos','sylk','dif','dbf','prn','qpw','123','wb*','wq*','html','htm',
].map((x) => `.${x}`).join(',');

const ExcelReader = () => {
	const [state, setState] = useState({
		file: {},
		data: [],
		key: [],
    });
    // console.log(state.key);

	const [dataConvert, setDataConvert] = useState([]);
	const [searchProd, setSearchProd] = useState([]);
	const [optionsFilter, setOptionsFilter] = useState([]);
	const [checkFileName, setCheckFileName] = useState(false);
	const [selectKey, setSelectKey] = useState(null);
    const [disableExport, setDisableExport] = useState(true);
    
	// Handle Import Excel

	const handleChange = (e) => {
		const files = e.target.files;
		if (files && files[0]) {
			setState({ ...state, file: files[0] });
			if (typeFile.includes(files[0].name.split('.').pop())) {
				setCheckFileName(true);
			} else setCheckFileName(false);
		}
	};

	const handleFile = () => {
		/* Boilerplate to set up FileReader */
		const reader = new FileReader();
		const rABS = !!reader.readAsBinaryString;

		reader.onload = (e) => {
			/* Parse data */
            const bstr = e.target.result;
			const wb = XLSX.read(bstr, {
				type: rABS ? 'binary' : 'array',
				bookVBA: true,
			});
			/* Get first worksheet */
			const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            // console.log(ws, 'ws');
            // console.log(wb, 'wsname');
			/* Convert array of arrays */
			const data = XLSX.utils.sheet_to_json(ws, {defval:""});
			/* Update state */
			setState({
				...state,
				data: data,
				key: data.length ? Object.keys(data[0]) : [],
			});
			setDataConvert([...data]);
		};

		if (rABS) {
			reader.readAsBinaryString(state.file);
		} else {
			reader.readAsArrayBuffer(state.file);
		}
	};

	// Handle Filter Data

	const handleFilterProd = () => {
		if (state.data?.length && searchProd?.length) {
			let arr = [];
			for (let valueKey of searchProd) {
				let filterArr = state.data.filter(
					(item) => item[selectKey] === valueKey['value']
				);
				arr = [...arr, ...filterArr];
			}

			setDataConvert(arr);
		} else if (!searchProd?.length) {
			setDataConvert(state.data);
		}
		setDisableExport(false);
	};

	// Handle Export Excel

	// const exportToCSV = (csvData, fileName) => {
	// 	const ws = XLSX.utils.json_to_sheet(csvData);
	// 	const wb = { Sheets: { data: ws }, SheetNames: ['data'] };
	// 	const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
	// 	const data = new Blob([excelBuffer], { type: fileType });
	// 	FileSaver.saveAs(data, fileName + fileExtension);
    // };
    
	const exportToCSV = (csvData, fileName) => {
		// const ws = XLSX.utils.json_to_sheet(csvData);
		// const wb = { Sheets: { data: ws }, SheetNames: [`${fileName}`] };
		// const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
		// const data = new Blob([excelBuffer], { type: fileType });
        // FileSaver.saveAs(data, fileName + fileExtension);
        
        const wb = XLSX.utils.book_new()
        const ws = XLSX.utils.json_to_sheet(csvData)
        XLSX.utils.book_append_sheet(wb, ws, fileName)
        XLSX.writeFile(wb, fileName.concat(fileExtension))
	};

	const handleExportCurrentList = () => {
        let currentList = [];

		for (let valueKey of searchProd) {
            let findElisOrderName = state.data?.find(item => item[selectKey] === valueKey['value'])['ELIS_Purchase_Order'];
            
            let filterCurrentList = state.data.filter(
                (item) => item[selectKey] === valueKey['value']
            )
            
            let currentListObj = {
                name: `ORDRSP_0${valueKey['label']}_${findElisOrderName}`,
                list: filterCurrentList.map(item => {
                    let newItem = {...item};
                    delete newItem['EDI'];
                    return newItem;
                })
            }
            
			// currentList = [...currentList, ...filterCurrentList];
			currentList.push(currentListObj)
        }
        currentList.map(item => exportToCSV(item.list, item.name));
    };

	// const handleExportRestList = () => {
	// 	let restList = [];
	// 	let searchProdValue = searchProd.map((item) => item.value);
	// 	let optionsFilterValue = optionsFilter.map((item) => item.value);

	// 	const restListValue = optionsFilterValue.filter((item) => {
	// 		if (!searchProdValue.includes(item)) {
	// 			return item;
	// 		}
	// 	});
	// 	for (let valueKey of restListValue) {
	// 		let filterRestList = state.data.filter(
	// 			(item) => item[selectKey] === valueKey
	// 		);
	// 		restList = [...restList, ...filterRestList].map(item => {
    //             delete item['EDI'];
    //             return item;
    //         });
	// 	}
	// 	exportToCSV(restList, 'rest-list');
	// };

	return (
		<React.Fragment>
			<h2 className="p-2 mt-4" htmlFor="file">Converter and Filter</h2>
			<div className="container d-flex" style={{ width: `500px` }}>
				<input
					type="file"
					className="form-control height-100"
					id="file"
					accept={typeFile}
					onChange={handleChange}
				/>
				<button className="btn btn-primary ml-2" onClick={handleFile} disabled={!checkFileName}>
					Convert
				</button>
			</div>
			{dataConvert.length ? (
				<div className="mt-4 p-4">
					<Row className="form-select__excel mt-2 mb-2 d-flex">
						<Col xl={3} md={6} className='pt-2 pb-2'>
                            <FormSelect
                                isMulti={false}
                                placeholder='Select key filter...'
                                value={
                                    selectKey
                                        ? [convertStrToObj(selectKey)]
                                        : []
                                }
                                options={state.key.map((item) =>
                                    convertStrToObj(item)
                                )}
                                onChange={(v) => {
                                    let uniqueArr = [
                                        ...new Set(
                                            state.data?.map(
                                                (item) => item[v['value']]
                                            )
                                        ),
                                    ];
                                    let newArrOptionFilter = uniqueArr.map(
                                        (item) => convertStrToObj(item)
                                    );
                                    setSelectKey(v['value']);
                                    setSearchProd([]);
                                    setDataConvert(state.data);
                                    setOptionsFilter(newArrOptionFilter);
                                }}
                            />
						</Col>

						<Col xl={5} md={12} lg={12} className='pt-2 pb-2'>
                            <FormSelect
                                isMulti={true}
                                placeholder='Select values filter...'
                                value={searchProd}
                                options={optionsFilter}
                                onChange={(value) => setSearchProd(value)}
                                closeMenuOnSelect={false}
                            />
						</Col>

						<Col xl={4} lg={12} md={12} className="text-right pt-2 pb-2">
							<button className="btn btn-primary ml-2 mb-2" onClick={handleFilterProd}>
								Filter
                            </button>
							<button
								className="btn btn-primary ml-2 mb-2"
								onClick={handleExportCurrentList}
								disabled={!(!disableExport && searchProd?.length)}
							>
								Export
							</button>

							{/* <button
								className="btn btn-primary ml-2 mb-2"
								onClick={handleExportRestList}
								disabled={!(!disableExport && searchProd?.length)}
							>
								Export - Rest List
							</button> */}
						</Col>
					</Row>
					
					<div className="wrapper__table__excel">
						{/* <table className="table__excel--fix-col table table-hover table-striped table-bordered">
							<thead>
								<tr>
									<th>No.</th>
									<th
										scope="col"
										className="white-space-nowrap"
									>
										{Object.keys(dataConvert[0])[0]}
									</th>
								</tr>
							</thead>
							<tbody>
								{dataConvert.map((item, id) => (
									<tr key={id}>
										<td>{id + 1}</td>
                                        <td
                                            className="white-space-nowrap"
                                            key={id}
                                        >
                                            {item[Object.keys(dataConvert[0])[0]]}
                                        </td>
									</tr>
								))}
							</tbody>
						</table> */}
						<table className="table__excel table table-hover table-striped table-bordered">
							<thead>
								<tr>
									<th>No.</th>
									{state.key.map((item, id) => (
										<th key={id} scope="col" className="white-space-nowrap" >
											{item}
										</th>
									))}
								</tr>
							</thead>
							<tbody>
								{dataConvert.map((item, id) => (
									<tr key={id}>
										<td>{id + 1}</td>
										{Object.keys(dataConvert[0]).map(
											(key, id) => (
												<td className="white-space-nowrap" key={id} >
													{item[key]}
												</td>
											)
										)}
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
			) : null}
		</React.Fragment>
	);
};

export default ExcelReader;
