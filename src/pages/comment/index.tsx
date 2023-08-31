import React, { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Input,
  Breadcrumb,
  Card,
  Message,
  Popconfirm,
  Select,
  Badge
} from '@arco-design/web-react';
import { useSelector, useDispatch } from 'react-redux';
// import axios from 'axios';
import {
  UPDATE_FORM_PARAMS,
  UPDATE_LIST,
  UPDATE_LOADING,
  UPDATE_PAGINATION,
} from './redux/actionTypes';
import useLocale from '../../utils/useLocale';
import { ReducerState } from '../../redux';
import styles from './style/index.module.less';
import { getList, remove } from '../../api/comment'
import {auditStatusOptions} from '../../const'
import dayjs from 'dayjs';



function Categories() {
  const locale = useLocale();
  const dispatch = useDispatch();
  const [query,setQuery] = useState({
    articleTitle:'',
    auditStatus:0,
  })



  const columns:any = [
    {
      title: "文章标题",
      dataIndex: 'articleTitle',
      fixed:'left',
      width: 160
    },
    {
      title: "昵称",
      dataIndex: 'nickName',    
    },
    {
      title: "当前回复内容",
      dataIndex: 'currentReplayContent',
    },
    {
      title: "目标回复ID",
      dataIndex: 'targetReplayId',
    },
    {
      title: "目标回复内容",
      dataIndex: 'targetReplayContent',
     
    },
    {
      title: "审核状态",
      dataIndex: 'auditStatus',
      render: (text) => {
        console.log(text)
        const current = auditStatusOptions.filter(item=>item.value=== +text);
        const obj = current[0]
        const enums = {
          1:'success',
          2:'error',
          3:'warning',
        }
        return <Badge status={enums[obj.value]} text={obj.label}/>
      }
    },
    {
      title: "评论时间",
      dataIndex: 'commentTime',
      render:(text)=>{
        return dayjs(text *1000).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: "审核时间",
      dataIndex: 'auditTime',
      render:(text)=>{
        return dayjs(text *1000).format('YYYY-MM-DD HH:mm:ss')
      }
    },
    {
      title: locale['searchTable.columns.operations'],
      dataIndex: 'operations',
      fixed:'right',
      width:200,
      render: (_, recode) => (
        <div className={styles.operations}>

          <Popconfirm
            focusLock
            title='确认删除该数据吗？'
            onOk={() => onDelete(recode)}

          >
            <Button type="text" status="danger" size="small">
              {locale['searchTable.columns.operations.delete']}
            </Button>
          </Popconfirm>

          <Button type="text" status="success" size="small">
            审核
            </Button>

        </div>
      ),
    },
  ];

  const commentState = useSelector((state: ReducerState) => state.comment);

  const { data, pagination, loading, formParams } = commentState;


  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData(current = 1, pageSize = 20, params = {}) {
    dispatch({ type: UPDATE_LOADING, payload: { loading: true } });
    try {
      const postData = {
        page: current,
        pageSize,
        ...params,
      }
      const res: any = await getList(postData);
      if (res.code === 0) {
        dispatch({ type: UPDATE_LIST, payload: { data: res.data.list } });
        dispatch({
          type: UPDATE_PAGINATION,
          payload: { pagination: { ...pagination, current, pageSize, total: res.data.totalCount } },
        });
        dispatch({ type: UPDATE_LOADING, payload: { loading: false } });
        dispatch({ type: UPDATE_FORM_PARAMS, payload: { params } });
      }


    } catch (error) {

    }


  }

  function onChangeTable(pagination) {
    const { current, pageSize } = pagination;
    fetchData(current, pageSize, formParams);
  }

  function onSearch(articleTitle) {
    setQuery({
      ...query,
      articleTitle
    })
    fetchData(1, pagination.pageSize, { ...query });
  }

  function onSelectSearch(auditStatus){
    setQuery({
      ...query,
      auditStatus
    })
    fetchData(1, pagination.pageSize, {...query});
  }



  const onDelete = async (row) => {
    const res: any = await remove(row);
    if (res.code === 0) {
      Message.success(res.msg)
      fetchData()
    } else {
      Message.success('删除失败，请重试')

    }
  }



  return (
    <div className={styles.container}>
      <Breadcrumb style={{ marginBottom: 20 }}>
        <Breadcrumb.Item>评论管理</Breadcrumb.Item>
      </Breadcrumb>
      <Card bordered={false}>
        <div className={styles.toolbar}>

          <div>

            <Input.Search
              style={{ width: 300 }}
              searchButton
              placeholder='请输入文章标题'
              onSearch={onSearch}
            />
            <Select placeholder='请选择审核状态' style={{ width: 160,marginLeft:20 }} 
              onChange={onSelectSearch}
            >
              {auditStatusOptions.map((option) => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
        <Table
          rowKey="_id"
          loading={loading}
          onChange={onChangeTable}
          pagination={pagination}
          columns={columns}
          data={data}
          scroll={{x:1000}}
        />


      </Card>
    </div>
  );
}

export default Categories;
