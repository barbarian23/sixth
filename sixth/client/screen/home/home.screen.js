import React, { useState, useEffect } from "react";
import '../../assets/css/home/home.css';
import { TR_TYPE_TIME, TR_TYPE_SETUP } from "../../constants/home/home.constant";
import { GET_LENGHT_LIST, START_CRAWL_DATA } from "../../action/home/home.action";
import { readFileExcel } from "../../service/excel/excel.client.service";
import { useSelector, useDispatch } from 'react-redux';
import Dropdown from 'react-dropdown';
import '../../assets/css/home/styleDropDown.css';

export default function Home() {
    const [mTime, setMTime] = useState(0);
    const [isTracking, setIsTracking] = useState(false);
    const [nameFile, setNameFile] = useState("");
    const [onBoarding, setOnBoarding] = useState(false);
    const [mNumber, setMNumber] = useState(0);
    const dispatch = useDispatch();
    let listPhone = useSelector(state => state.home.listPhone);
    let phoneNumberChecking = useSelector(state => state.home.phoneNumberChecking);
    let sumIndex = useSelector(state => state.home.sumIndex);
    let isCrawlDone = useSelector(state => state.home.isCrawlDone);

    useEffect(() => {
        setIsTracking(!isCrawlDone);
    }, [isCrawlDone]);

    let readFile = (e) => {
        // console.log("name file is ", e.target.files[0].name);
        let nameFile = e.target.files[0].name;
        setNameFile(nameFile);
        readFileExcel(e.target.files[0], (data) => {
            setIsTracking(true);
            //data là mảng chứa danh sách thuê bao và số tiền
            dispatch({ type: GET_LENGHT_LIST, data: { sumIndex: data.length } });
            data.forEach((item, index) => {
                //Bỏ qua dòng đầu vì là tiêu đề
                if (index > 0) {
                    // console.log("data in file excel", item);
                    let itemPhone = {
                        index: index,
                        phone: item[0]
                    }
                    listPhone.push(itemPhone);
                }
                if (index == (data.length - 1)) {
                    console.log("data - endoflist", item[0], " ", item[1], " listPhone", listPhone);
                    dispatch({ type: START_CRAWL_DATA, data: { listPhone: listPhone, nameFile: nameFile.substring(0, nameFile.length - 5), time: mTime } });
                    setOnBoarding(true);
                }
            });
        });

        //phải cần dòng dưới, vì nếu như lần thứ hai chọn cùng 1 file, sẽ không được tính là opnchange, hàm onchange sẽ không gọi lại
        e.target.value = null;
    }

    let onInputTime = (e) => {
        setMTime(e.target.value);
    }

    let setUpTime = () => {
        dispatch({ type: ADD_PHONE, data: { mTime: mTime } });
    }

    let onInputNumber = (e) => {
        setMNumber(e.value);
    }

    let startCrawlData = () => {
        dispatch({
            type: START_CRAWL_DATA,
            data: {
                mNumber: mNumber
            }
        })
    }

    let percentProcess = (index, sum) => {
        console.log("sum ", sum);
        return ((index / sum) * 100).toFixed(2);
    }

    const options = [
        "8481", "8482", "8483", "8484", "8485", "8488", "8491", "8494", "8439", "8478"
    ];
    const defaultOption = options[0];
    return (
        <div className="crawl-login" id="div_craw">
            <div style={{
                position: "absolute",
                top: "20px",
                fontSize: "36px",
                fontWeight: "600"
            }}>TRA CỨU SỐ ĐIỆN THOẠI</div>
            {
                !isTracking ?
                    <div>
                        <div className="crawl-login">
                            <div className="input-add-div">
                                <h3 className="input-title">Chọn đầu số</h3>
                                <Dropdown options={options} value={defaultOption} placeholder="Select an option" onChange={onInputNumber} />
                                {/* <input className="input-add" type="number" min="1" max="60" defaultValue="1" placeholder={TR_TYPE_TIME} onChange={onInputTime} /> */}
                                {/* <input className="input-add-button" type="button" value={TR_TYPE_SETUP} onClick={setUpTime} /> */}
                            </div>
                            <input className="start-crawl-button" type="button" value={TR_TYPE_SETUP} onClick={startCrawlData} />
                            {/* <div id="crawl_login_file_input_up">
                                <label htmlFor="xlsx">Bấm vào đây để chọn tệp(excel)</label>
                                <input type="file"
                                    id="xlsx" name="xlsx"
                                    accept="xlsx" onChange={readFile} />
                                <span id="span_file_input_error"></span>
                            </div> */}
                        </div>
                        {
                            isCrawlDone && onBoarding ?
                                <div style={{
                                    position: "absolute",
                                    bottom: "10px",
                                    left: "50%",
                                    width: "100%",
                                    transform: 'translate(-50%, 10px)',
                                }} className="tracking-index-number-upper">
                                    <text>Tra cứu thành công , tên tệp đã crawl là <span style={{ color: "green" }}>{nameFile}</span></text>
                                </div>
                                :
                                null
                        }
                    </div>
                    :
                    null
            }
            {
                isTracking ?
                    <div>
                        <div className="animation-tracking">
                            <div className="crawl-loading-parent" id="div_loginin_loading">
                                <div className="crawl-login-loading">
                                    <div className="circle"></div>
                                    <div className="circle"></div>
                                    <div className="circle"></div>
                                    <div className="shadow"></div>
                                    <div className="shadow"></div>
                                    <div className="shadow"></div>
                                </div>
                            </div>
                        </div>

                        <div>
                            <div className="tracking-index-number-upper">
                                <text>Đang tra cứu tệp <span style={{ color: "green" }}>{nameFile}</span></text>
                            </div>
                            <div className="tracking-index-number-upper">
                                <text style={{ textAlign: "center" }}>Đang tra cứu số {phoneNumberChecking.index}</text>
                            </div>
                            <div className="tracking-index-number-bellow">
                                <text>Hoàn thành {percentProcess(phoneNumberChecking.index, sumIndex)}%</text>
                            </div>
                        </div>

                    </div>
                    :
                    null
            }
        </div>
    );
}